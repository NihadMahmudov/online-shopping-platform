import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../../../context/ProductContext';
import styles from './StoryBar.module.css';

const StoryBar = () => {
  const { stories } = useProducts();
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openStory = (index) => {
    setCurrentIndex(index);
    setSelectedStory(stories[index]);
  };

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedStory(stories[currentIndex + 1]);
    } else {
      setSelectedStory(null);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedStory(stories[currentIndex - 1]);
    }
  };

  return (
    <div className={styles.storyBarWrapper}>
      <div className={`container ${styles.storyContainer}`}>
        <div className={styles.stories}>
          {stories.map((story, index) => (
            <div key={story.id} className={styles.storyItem} onClick={() => openStory(index)}>
              <div className={styles.storyRing}>
                <img src={story.img} alt={story.label} />
              </div>
              <span className={styles.storyLabel}>{story.label}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedStory && (
          <motion.div 
            className={styles.viewerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className={styles.closeBtn} onClick={() => setSelectedStory(null)}>
              <X size={30} />
            </button>

            <div className={styles.viewerContent}>
              <button className={styles.navBtn} onClick={prevStory} disabled={currentIndex === 0}>
                <ChevronLeft size={40} />
              </button>

              <div className={styles.storyWindow}>
                <div className={styles.progressBar}>
                  {stories.map((_, i) => (
                    <div key={i} className={styles.progressTrack}>
                      <motion.div 
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: i === currentIndex ? '100%' : i < currentIndex ? '100%' : '0%' }}
                        transition={{ duration: i === currentIndex ? 5 : 0, ease: 'linear' }}
                        onAnimationComplete={() => {
                          if (i === currentIndex) nextStory();
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className={styles.storyHeader}>
                  <img src={selectedStory.img} alt="" className={styles.miniAvatar} />
                  <span>{selectedStory.label}</span>
                </div>

                <img src={selectedStory.img} alt="" className={styles.mainStoryImg} />
              </div>

              <button className={styles.navBtn} onClick={nextStory}>
                <ChevronRight size={40} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryBar;
