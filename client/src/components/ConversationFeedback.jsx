import CEFRProgressBar from './CEFRProgressBar';

function ConversationFeedback({ evaluation, inputMode }) {
  const attributes = [
    ['complexity', 'Complexity'],
    ['accuracy', 'Accuracy'],
    ['fluency', 'Fluency'],
    [inputMode === 'voice' ? 'pronunciation' : 'clarity', inputMode === 'voice' ? 'Pronunciation' : 'Clarity']
  ];

  return (
    <details className="feedback-details">
      <summary>
        <span className="level-chip">CEFR {evaluation.overall.level}</span>
        <span>View feedback</span>
      </summary>
      <div className="feedback-body">
        <p>{evaluation.overall.explanation}</p>
        <div className="feedback-grid">
          {attributes.map(([key, label]) => (
            <article key={key}>
              <CEFRProgressBar level={evaluation.attributes[key].level} attribute={label} />
              <p>{evaluation.attributes[key].feedback}</p>
              <p className="feedback-tip"><strong>Try:</strong> {evaluation.attributes[key].tip}</p>
            </article>
          ))}
        </div>
      </div>
    </details>
  );
}

export default ConversationFeedback;
