const Letters = ({ letter, className }) => {
  return (
    <div
      className={`font-extrabold text-center rounded-lg border-2 border-letter ${className}`}
    >
      {letter}
    </div>
  );
};

export default Letters;
