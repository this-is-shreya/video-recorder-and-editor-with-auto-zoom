import React, { useRef } from 'react';
import styles from'./styles/TitleCard4.module.css';

const TitleCard4 = () => {

  return (
    <div className={styles.titleCard}>
      <div className={styles.upperWrap}>
        <div className={styles.text}>Title Text</div>
      </div>
      <div className={styles.line}></div>
      <div className={styles.lowerWrap}>
        <div className={styles.text}>This is just the lower info</div>
      </div>
    </div>
  );
}

export default TitleCard4;
