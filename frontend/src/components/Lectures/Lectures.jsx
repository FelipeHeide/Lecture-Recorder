import React, { useEffect, useState } from 'react';
import styles from './Lectures.module.css';
import { IoArrowBackOutline } from "react-icons/io5";
import { MdKeyboardArrowDown, MdOutlineEdit } from "react-icons/md";
import { FaRegTrashAlt, FaRegSave } from "react-icons/fa";
import { Update } from '../../ApiAssets';

const Lectures = ({ userName, setSection }) => {
  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState(false);
  const [activeText, setActiveText] = useState("Transcript");
  const [editMode, setEditMode] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [notMovingsubjectName, setNotMovingsubjectName] = useState('');
  const [lectureTitles, setLectureTitles] = useState([]);
  const [transcriptTitles, setTranscriptTitles] = useState([]);
  const [transcriptTexts, setTranscriptTexts] = useState([]);
  const [transcriptDetailedSummaries, setTranscriptDetailedSummaries] = useState([]);
  const [transcriptBulletSummaries, setTranscriptBulletSummaries] = useState([]);



  useEffect(() => {
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const storedSubjects = userLocal.user.subjects || [];
    setLectures(storedSubjects);
    const subjectNames = storedSubjects.map(subject => subject.name);
    setSubjects(subjectNames);

  
    const initialTranscriptTexts = storedSubjects.flatMap(subject => subject.lectures.map(lecture => lecture.text));
    const initialTranscriptDetailedSummaries = storedSubjects.flatMap(subject => subject.lectures.map(lecture => lecture.detailed_summary));
    const initialTranscriptBulletSummaries = storedSubjects.flatMap(subject => subject.lectures.map(lecture => lecture.bullet_summary));
  
    setTranscriptTexts(initialTranscriptTexts);
    setTranscriptDetailedSummaries(initialTranscriptDetailedSummaries);
    setTranscriptBulletSummaries(initialTranscriptBulletSummaries);
  }, []);

  const SetSubjectSection = (subject) => {
    const filtered = lectures.find(lecture => lecture.name === subject);
    setFilteredLectures(filtered);

    setSubjectName(filtered.name)
    setNotMovingsubjectName(filtered.name)
    

    setTranscriptTitles(
      filtered.lectures.map((lecture) => {
        return lecture.transcript_title
      })
    );  

    setLectureTitles(
      filtered.lectures.map((lecture) => {
        return lecture.lecture_title
      })
    );  

  
  
  }

  const ShowInfo = (index) => {
    const lectureElements = document.getElementsByClassName(styles.lecture);
    const lectureElement = lectureElements[index];

    if (lectureElement) {
      const pElement = lectureElement.querySelector(`.${styles.transcripts}`);
      const iconElement = lectureElement.getElementsByClassName(styles.icon)[0];

      if (pElement && iconElement) {
        pElement.style.display = pElement.style.display === 'none' ? 'block' : 'none';
        iconElement.style.transform = iconElement.style.transform === 'rotate(0deg)' ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }
  }

  const toggleEditMode = () => setEditMode(!editMode);

  const handleSubjectNameChange = (e) => setSubjectName(e.target.innerText);
  
  const handleLectureTitleChange = (index, e) => setLectureTitles(titles => titles.map((title, i) => i === index ? e.target.innerText : title));
  
  const handleTranscriptTitleChange = (index, e) => setTranscriptTitles(titles => titles.map((title, i) => i === index ? e.target.innerText : title));
  
  const handleTranscriptTextChange = (index, e) => setTranscriptTexts(texts => texts.map((text, i) => i === index ? e.target.innerText : text));
  
  const handleTranscriptDetailedSummaryChange = (index, e) => setTranscriptDetailedSummaries(summaries => summaries.map((summary, i) => i === index ? e.target.innerText : summary));
  
  const handleTranscriptBulletSummaryChange = (index, e) => setTranscriptBulletSummaries(summaries => summaries.map((summary, i) => i === index ? e.target.innerText : summary));
  

  const saveChanges = async () => {
    const localUser = JSON.parse(localStorage.getItem('user'));
  
    const subjectIndex = localUser.user.subjects.findIndex(subject => subject.name === notMovingsubjectName);

  
    const updatedLectures = lectureTitles.map((title, index) => ({
      lecture_title: title,
      transcript_title: transcriptTitles[index],
      text: transcriptTexts[index],
      detailed_summary: transcriptDetailedSummaries[index],
      bullet_summary: transcriptBulletSummaries[index]
    }));
    console.log(updatedLectures)
  
    localUser.user.subjects[subjectIndex].lectures = updatedLectures;
    localUser.user.subjects[subjectIndex].name = subjectName;
  
    localStorage.setItem('user', JSON.stringify(localUser));
  
    const { _id, ...userWithoutId } = localUser.user;
  
    setEditMode(!editMode);
  
    const storedSubjects = localUser.user.subjects || [];
  
    const filtered = storedSubjects.find(lecture => lecture.name === subjectName);
  
    setFilteredLectures(filtered);
    setSubjectName(filtered.name);
    setNotMovingsubjectName(filtered.name);
    setLectures(storedSubjects);
  
    const subjectNames = storedSubjects.map(subject => subject.name);
    setSubjects(subjectNames);
  
    const initialTranscriptTexts = storedSubjects.flatMap(subject => subject.lectures.map(lecture => lecture.text));
    const initialTranscriptDetailedSummaries = storedSubjects.flatMap(subject => subject.lectures.map(lecture => lecture.detailed_summary));
    const initialTranscriptBulletSummaries = storedSubjects.flatMap(subject => subject.lectures.map(lecture => lecture.bullet_summary));
  
    setTranscriptTexts(initialTranscriptTexts);
    setTranscriptDetailedSummaries(initialTranscriptDetailedSummaries);
    setTranscriptBulletSummaries(initialTranscriptBulletSummaries);
  
    await Update(userWithoutId, _id, localUser.token);
  
    alert("Lecture saved successfully!");
  };

  const handleNavigation = async() => {
    if (editMode) {
      const confirmLeave = window.confirm("You have unsaved changes. Do you really want to leave?");
      if (!confirmLeave) {
        return;
      }
    }
    if (filteredLectures) {
      if(editMode){        await saveChanges()
      }
      setFilteredLectures(false);
    } else {
      setSection("dashboard");
    }
  };


  const handleDeleteSubject = async() => {
    if (window.confirm(`Are you sure you want to delete the subject "${subjectName}"?`)) {
      const localUser = JSON.parse(localStorage.getItem('user'));
      const updatedSubjects = localUser.user.subjects.filter(subject => subject.name !== notMovingsubjectName );
      localUser.user.subjects = updatedSubjects;
      localStorage.setItem('user', JSON.stringify(localUser));
      const { _id, ...userWithoutId } = localUser.user;

      await Update(userWithoutId, _id, localUser.token); 
      alert("Lecture saved successfully!");

      setSubjects(updatedSubjects.map(subject => subject.name));
      setFilteredLectures(false);
    }
  };

  const handleDeleteLecture = async(index) => {

    if (window.confirm(`Are you sure you want to delete the lecture "${lectureTitles[index]}"?`)) {
      const updatedLectures = [...filteredLectures.lectures];
      updatedLectures.splice(index, 1);
      const updatedFilteredLectures = { ...filteredLectures, lectures: updatedLectures };

      const localUser = JSON.parse(localStorage.getItem('user'));
      const subjectIndex = localUser.user.subjects.findIndex(subject => subject.name === subjectName);
      localUser.user.subjects[subjectIndex] = updatedFilteredLectures;
      localStorage.setItem('user', JSON.stringify(localUser));

      const { _id, ...userWithoutId } = localUser.user;

      await Update(userWithoutId, _id, localUser.token); 
      alert("Lecture saved successfully!");

      setFilteredLectures(updatedFilteredLectures);
      setLectureTitles(updatedLectures.map(lecture => lecture.lecture_title));
      setTranscriptTitles(updatedLectures.map(lecture => lecture.transcript_title));
      setTranscriptTexts(updatedLectures.map(lecture => lecture.text));
      setTranscriptDetailedSummaries(updatedLectures.map(lecture => lecture.detailed_summary));
      setTranscriptBulletSummaries(updatedLectures.map(lecture => lecture.bullet_summary));
    }
  };

  return (
    <div className={styles.wrapper}>
      <IoArrowBackOutline
        className={styles.back_icon}
        onClick={handleNavigation}
      />
      {filteredLectures ? (
        <div>
          <div className={styles.button_section}>
            {editMode && <button onClick={saveChanges}>Save <FaRegSave /></button>}
            {!editMode && <button onClick={toggleEditMode}>Edit <MdOutlineEdit className={styles.icon} /></button>}
          </div>
          <h2 contentEditable={editMode} suppressContentEditableWarning={true} onInput={handleSubjectNameChange} onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }}
>
            {filteredLectures.name}
            {editMode && <FaRegTrashAlt className={styles.trash_icon} onClick={handleDeleteSubject}/>}
          </h2>
          <div className={styles.navigation}>
            <button
              onClick={() => setActiveText("Transcript")}
              className={activeText === "Transcript" ? styles.active : ""}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveText("Detailed Summary")}
              className={activeText === "Detailed Summary" ? styles.active : ""}
            >
              Detailed Summary
            </button>
            <button
              onClick={() => setActiveText("Bullet Summary")}
              className={activeText === "Bullet Summary" ? styles.active : ""}
            >
              Bullet Summary
            </button>
          </div>

          {filteredLectures.lectures.slice().reverse().map((lecture, indexNo) => {
  const index = filteredLectures.lectures.length - indexNo - 1;
  return (
    <div key={index} className={styles.lecture}>
      <div className={styles.lecture_general} onClick={() => ShowInfo(indexNo)}>
        <div>
          <h3
            contentEditable={editMode}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
              }
            }}
          
            suppressContentEditableWarning={true}
            onInput={(e) => handleLectureTitleChange(index, e)}
          >
            {lecture.lecture_title}
          </h3>
          {editMode && (
            <FaRegTrashAlt
              className={styles.trash_icon}
              onClick={() => handleDeleteLecture(index)}
            />
          )}
        </div>
        <MdKeyboardArrowDown className={styles.icon} />
      </div>
      <div className={styles.transcripts}>
        <b
          contentEditable={editMode}
          suppressContentEditableWarning={true}
          onInput={(e) => handleTranscriptTitleChange(index, e)}
        >
          {lecture.transcript_title}
        </b>
        <br></br>
        <br></br>
        {activeText === "Transcript" && (
          <div
            style={{ whiteSpace: 'pre-wrap' }}
            contentEditable={editMode}
            suppressContentEditableWarning={true}
            onBeforeInput={(e) => handleTranscriptTextChange(index, e)}
          >
            {lecture.text}
          </div>
        )}
        {activeText === "Detailed Summary" && (
          <div
            style={{ whiteSpace: 'pre-wrap' }}
            contentEditable={editMode}
            suppressContentEditableWarning={true}
            onInput={(e) => handleTranscriptDetailedSummaryChange(index, e)}
          >
            {lecture.detailed_summary}
          </div>
        )}
        {activeText === "Bullet Summary" && (
          <div
            style={{ whiteSpace: 'pre-wrap' }}
            contentEditable={editMode}
            suppressContentEditableWarning={true}
            onInput={(e) => handleTranscriptBulletSummaryChange(index, e)}
          >
            {lecture.bullet_summary}
          </div>
        )}
      </div>
    </div>
  );
})}
          </div>

      ) : (
        <div>
      <h2><b>{userName}'s</b> subjects:</h2>
      {subjects.length === 0 ? (
        <h3 className={styles.no_subjects}>No subjects available. Record a lecture.</h3>
      ) : (
        <div className={styles.subjects_container}>
          {subjects.map((subject) => (
            <div key={subject} className={styles.subject_container}>
              <button
                onClick={() => SetSubjectSection(subject)}
                className={styles.subject_button}
              >
                {subject}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
      )}
    </div>
  );
}

export default Lectures;