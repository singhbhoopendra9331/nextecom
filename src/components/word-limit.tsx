interface WordLimitProps {
  text: string;
  maxLength?: number;
}

/** @description add three dots to the end of the text if it exceeds the limit
 * @param text - the text to be maxLength
 * @param maxLength - the max length of the text
 * @returns the text with the maxLength
 */

const WordLimit = ({ text, maxLength=32 }: WordLimitProps) => {
  const truncatedText = text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

  return (
    <p title={text}>
      {truncatedText}
    </p>
  );
};

export default WordLimit;