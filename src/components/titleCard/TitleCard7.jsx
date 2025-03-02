import React from 'react'
import styles from  "./styles/TitleCard7.module.css"

const TitleCard7 = () => {
  return (
    <div className={styles.titleCard}>
      <div className={styles.stage}>
        <div className={styles.wrapper}>
          <div className={styles.slash}></div>
          <div className={styles.sides}>
            <div className={styles.side}></div>
            <div className={styles.side}></div>
            <div className={styles.side}></div>
            <div className={styles.side}></div>
          </div>
          <div className={styles.text}>
            <div className={styles.textBacking}>Hello</div>
            <div className={styles.textLeft}>
              <div className={styles.inner}>Hello</div>
            </div>
            <div className={styles.textRight}>
              <div className={styles.inner}>Hello</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TitleCard7