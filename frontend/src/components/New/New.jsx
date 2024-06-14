"use strict";

import React, { useState, useEffect, useRef } from 'react';
import { AssemblyAI } from 'assemblyai';
import styles from './New.module.css';
import { IoArrowBackOutline } from "react-icons/io5";
import { FaSpinner, FaArrowRight, FaArrowLeft   } from "react-icons/fa";
import { Update, Grok } from '../../ApiAssets';


const New = ({ setSection }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState(false);
  const [buttonText, setButtonText] = useState('Start Recording');
  const [summary, setSummary] = useState(false);
  const [bulletSummary, setBulletSummary] = useState(false);
  const [textType, setTextType] = useState("Transcript");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [title, setTitle] = useState('');
  const [transcriptTitle, setTranscriptTitle] = useState('');

  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        setButtonText('Done');
      
        if (audioBlob) {
        
          try {
            const client = new AssemblyAI({ apiKey: import.meta.env.VITE_ASSEMBLY_API_KEY, });
    
            const transcript = await client.transcripts.transcribe({ audio: audioBlob });
      
            if (transcript.status === 'error') {
              setIsTranscribing(false);
              return;
            }
      
            setTranscriptText(transcript.text);
            
            const responser = await Grok("Build an super ultra-detailed and concise summary. Without any title nor description, just the summary. It is important to include all information, do not exclude any information: " + transcript.text)
            const summaryText = responser.choices[0].message.content
            setSummary(summaryText);

            const responser_bullet = await Grok("Build a concise and very detailed bullet summary. Without any title or description, just the summary: " + transcript.text)
            const summaryText_bullet = responser_bullet.choices[0].message.content
            setBulletSummary(summaryText_bullet);

              const titleParams = {
                audio: audioBlob,
                summarization: true,
                summary_model: 'informative',
                summary_type: 'headline',
              };
              const titleTranscript = await client.transcripts.transcribe(titleParams);
              setTranscriptTitle(titleTranscript.summary);
      
            setButtonText('Done');
            setIsTranscribing(false);
          } catch (error) {
            console.error('Error transcribing audio:', error);
            setIsTranscribing(false);
          }
        }
      });

      mediaRecorder.start();
      setIsRecording(true);
      setButtonText('Stop Recording');
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopRecording = async() => {
    const confirmStop = window.confirm(
        "Are you sure you want to stop the recording?"
      );
    
      if (!confirmStop) {
        return;
      }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true); 
      
    }
  };

  const Done = async() => {
    const userLocal = JSON.parse(localStorage.getItem("user"));
  
    if (!title) {
      alert("Please enter a title for the lecture.");
      return;
    }
  
    if (!selectedSubject || selectedSubject=="selectionnnnn") {
      alert("Please select a subject for the lecture.");
      return;
    }
    
    const confirmSave = window.confirm("Are you sure you want to finish and save this lecture?");
    
      if (!confirmSave) {
        return;
      }
    const newLecture = {
      lecture_title: title,
      transcript_title: transcriptTitle,
      text: transcriptText,
      detailed_summary: summary,
      bullet_summary: bulletSummary
    };
  
    const subjectIndex = userLocal.user.subjects.findIndex(subject => subject.name === selectedSubject);

  if (subjectIndex !== -1) {
    userLocal.user.subjects[subjectIndex].lectures.push(newLecture);
  } else {
    const newSubject = {
      name: selectedSubject,
      lectures: [newLecture]
    };
    userLocal.user.subjects.push(newSubject);
  }

  localStorage.setItem("user", JSON.stringify(userLocal));

  
    setTitle("");
    setTranscriptTitle("")
    setSelectedSubject("");
    setTranscriptText("");
    setSummary("");
    setBulletSummary("");
    
    try {
      const { _id, ...userWithoutId } = userLocal.user;

      await Update(userWithoutId, _id, userLocal.token); 
              alert("Lecture saved successfully!");
        setSection("dashboard");
      } catch (error) {
        alert("Error saving lecture. Please try again.");
        console.error("Error saving lecture:", error);
      }
    
  };

  const handleButtonClick = () => {
    if (!isRecording && buttonText === 'Start Recording') {
      startRecording();
    } else if (isRecording && buttonText === 'Stop Recording') {
      stopRecording();
    }else if (!isRecording && buttonText === 'Done') {
        Done();
      }
  };
  const handleTranscriptTitleChange = (e) => {
     setTranscriptTitle(e.target.value);
  };
  const handleTranscriptChange = (e) => {
    setTranscriptText(e.target.value);
  };

  const handleSummaryChange = (e) => {
    setSummary(e.target.value);
  };
  
  const handleBulletSummaryChange = (e) => {
    setBulletSummary(e.target.value);
  };

  const handleTextSectionChange = (direction) => {
    const sections = ["Transcript", "Detailed Summary", "Bullet Summary"];
    let currentIndex = sections.indexOf(textType);
  
    if (direction === "back") {
      currentIndex = (currentIndex - 1 + sections.length) % sections.length;
    } else if (direction === "forward") {
      currentIndex = (currentIndex + 1) % sections.length;
    }
  
    const newSection = sections[currentIndex];
    setTextType(newSection);
  
  };

  useEffect(() => {
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const storedSubjects = userLocal.user.subjects || [];
    const subjectNames = storedSubjects.map(subject => subject.name);
    setSubjects(subjectNames);
    const handleBeforeUnload = (event) => {
      const message = 'Are you sure you want to leave? Changes you made may not be saved.';
      event.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

  }, []);


  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSubjectChange = (e) => {
    if (e.target.value === "add-new") {
      const newSubject = prompt("What's the name of your new subject?");
      if (newSubject) {
        if (subjects.includes(newSubject) ) {
          alert(`The subject "${newSubject}" already exists.`);
          return;
        }
  
        setSubjects([...subjects, newSubject]);
        const userLocal = JSON.parse(localStorage.getItem("user"));
        userLocal.user.subjects.push({
          name: newSubject,
          lectures: []
        })
    
        localStorage.setItem("user", JSON.stringify(userLocal));
      }
    } else {
      setSelectedSubject(e.target.value);
    }
  };
  

  return (
    <div className={styles.wrapper}>
      <div>
      <IoArrowBackOutline
  onClick={() => {
    const confirmExit = window.confirm(
      "Are you sure you want to exit? You will lose your progress."
    );
    if (confirmExit) {
      setSection("dashboard");
    }
  }}
  className={styles.back_icon}
/>        <div className={styles.information}>
        <input type="text" placeholder="Title" value={title} onChange={handleTitleChange} />
          <select name="subject" id="" value={selectedSubject} onChange={handleSubjectChange}>
            <option value="selectionnnnn">Select a subject</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject}>{subject}</option>
            ))}
            <option value="add-new">Add New Subject</option>
          </select>

          <button onClick={handleButtonClick}>{isTranscribing ? <FaSpinner className={styles.spinner} /> : buttonText}</button>
          <div className={styles.text} style={{ display: transcriptText && !isTranscribing ? 'block' : 'none' }}>
            <div className={styles.section_type}> {textType} <div> <FaArrowLeft className={styles.arrow} onClick={() => handleTextSectionChange("back")} /> <FaArrowRight className={styles.arrow} onClick={() => handleTextSectionChange("forward")} /></div></div>
            <input className={styles.input_transcript_title} type="text" value={transcriptTitle} onChange={handleTranscriptTitleChange}/>
            {textType==="Transcript" ? <textarea className={styles.recordedText}     value={transcriptText} onChange={handleTranscriptChange} /> : textType==="Detailed Summary" ?
            <textarea className={styles.recordedText} value={summary} onChange={handleSummaryChange} /> : textType==="Bullet Summary" ?
            <textarea className={styles.recordedText} value={bulletSummary} onChange={handleBulletSummaryChange} /> : null}

          </div>
        </div>
      </div>
    </div>
  );
};

export default New;