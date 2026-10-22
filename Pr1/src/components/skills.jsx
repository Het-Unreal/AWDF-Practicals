import React from 'react';

const Skills = () => {
  const skillList = ["Unity", "C++", "JavaScript", "React", "Node.js"];

  return (
    <section id="skills">
      <h2>My Skills</h2>
      <ul>
        {skillList.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </section>
  );
};

export default Skills;
