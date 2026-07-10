import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import styles from './LiveChat.module.css';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.liveChatContainer}>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <h4>Bame Dəstək</h4>
              <p>Adətən bir neçə dəqiqəyə cavab veririk</p>
            </div>
            <button className={styles.closeBtn} onClick={toggleChat}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.chatBody}>
            <div className={styles.messageReceiver}>
              Salam! Sizə necə kömək edə bilərik? 👋
            </div>
          </div>
          <div className={styles.chatFooter}>
            <input type="text" placeholder="Mesajınızı yazın..." className={styles.chatInput} />
            <button className={styles.sendBtn}>Göndər</button>
          </div>
        </div>
      )}

      <button className={styles.chatToggleButton} onClick={toggleChat}>
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && <span className={styles.tooltip}>Bizimlə əlaqə</span>}
      </button>
    </div>
  );
};

export default LiveChat;
