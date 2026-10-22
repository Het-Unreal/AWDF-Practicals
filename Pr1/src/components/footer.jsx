import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div>
        <p>&copy; {new Date().getFullYear()} Het Kathiriya. All rights reserved.</p>
      </div>
      <div>
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
        {' | '}
        <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </footer>
  );
};

export default Footer;
