import { useState } from 'react';

export default function Contact() {
  const [message, setMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <section>
      <h2>Contact Me</h2>
      
      <button onClick={() => setShowTooltip(!showTooltip)}>
        {showTooltip ? 'Hide Help' : 'Need Help?'}
      </button>
      
      {showTooltip && <p>Please enter your inquiry in the text box below.</p>}

      <br /><br />
      
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Type a message..."
      />
      <p>Live Input: {message}</p>
    </section>
  );
}