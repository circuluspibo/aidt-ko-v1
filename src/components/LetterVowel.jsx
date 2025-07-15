const LetterVowel = ({ letter, className }) => {
  return (
    <div
      className={`font-extrabold text-center rounded-lg border-2 border-vowel ${className}`}
    >
      {letter}
    </div>
  );
};

export default LetterVowel;
