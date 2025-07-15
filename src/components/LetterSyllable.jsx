const LetterSyllable = ({ letter, className }) => {
  return (
    <div
      className={`font-extrabold text-center rounded-lg border-2 border-syllable ${className}`}
    >
      {letter}
    </div>
  );
};

export default LetterSyllable;
