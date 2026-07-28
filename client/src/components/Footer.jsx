import React from 'react';

function Footer() {
  return (
    <footer className="bg-brand-sand text-center p-6">
      <p className="text-brand-ink/70">
        &copy; {new Date().getFullYear()} RoommateFinder. All Rights Reserved.
      </p>
    </footer>
  );
}

export default Footer;