import React from "react";
import { PiVideo } from "react-icons/pi";

const ProjectCard = ({date}) => {
    const day = new Date(Number(date)).getDate();
    const month = new Date(Number(date)).getMonth()+1;
    const year = new Date(Number(date)).getFullYear();

  return (
    <div className="project-card">
      <PiVideo size={150} color="rgb(242 21 233)" style={{margin: "0 auto"}}/>
      <p className="heading">Project card</p>
      <p className="date">Created on: {`${day}-${month}-${year}`}</p>
    </div>
  );
};

export default ProjectCard;
