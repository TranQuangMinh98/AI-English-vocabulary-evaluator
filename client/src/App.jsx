import { useEffect, useRef, useState } from 'react';
import questions from '../../shared/conversation-questions.json';
import ConversationFeedback from './components/ConversationFeedback';
import ConversationInput from './components/ConversationInput';

const API_URL = import.meta.env.VITE_API_URL || '';
const firstQuestion = { role: 'coach', text: questions[0].question };

function App() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([firstQuestion]);
  const [unrelatedCount, setUnrelatedCount] = useState(0);
  const [inputMode, setInputMode] = useState('text');
  const [textDraft, setTextDraft] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceHint, setShowVoiceHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const messageListRef = useRef(null);
  const question = questions[questionIndex];

  useEffect(() => {
    messageListRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  const reset = () => {
    setQuestionIndex(0);
    setMessages([firstQuestion]);
    setUnrelatedCount(0);
    setInputMode('text');
    setTextDraft('');
    setVoiceTranscript('');
    setShowVoiceHint(false);
    setIsLoading(false);
    setError('');
    setComplete(false);
  };

  const moveForward = (nextMessages, prefix = '') => {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= questions.length) {
      setMessages([...nextMessages, { role: 'coach', text: 'Let’s finish here. Thanks for practicing with me today!' }]);
      setComplete(true);
      return;
    }

    const next = questions[nextIndex];
    const topicChanged = next.topic !== question.topic;
    const nextText = topicChanged
      ? `Let’s move to our next topic: ${next.topic}. ${next.question}`
      : `${prefix}${prefix ? ' ' : ''}${next.question}`;

    setQuestionIndex(nextIndex);
    setMessages([...nextMessages, { role: 'coach', text: nextText }]);
  };

  const submitResponse = async (value) => {
    setShowVoiceHint(false);
    const response = value.trim();
    if (!response || response.length > 2000) {
      setError('Enter a response between 1 and 2,000 characters.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const apiResponse = await fetch(`${API_URL}/api/conversation-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, response, inputMode })
      });
      const data = await apiResponse.json();
      if (!apiResponse.ok) throw new Error(data.error || 'The answer could not be evaluated. Try again.');

      const learnerMessage = { role: 'learner', text: response, inputMode };
      const nextMessages = [...messages, data.aligned ? { ...learnerMessage, evaluation: data.evaluation } : learnerMessage];

      setTextDraft('');
      setVoiceTranscript('');

      if (!data.aligned) {
        if (unrelatedCount === 0) {
          setMessages([...nextMessages, {
            role: 'coach',
            text: `That’s great, but we’re currently talking about ${question.topic}. Let’s get back on track: ${question.question}`
          }]);
          setUnrelatedCount(1);
        } else {
          setUnrelatedCount(0);
          moveForward(nextMessages, 'Let’s move to the next question:');
        }
        return;
      }

      setUnrelatedCount(0);
      moveForward([...nextMessages, { role: 'coach', text: data.acknowledgment }]);
    } catch (requestError) {
      setError(requestError.message || 'The answer could not be evaluated. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspire = () => {
    if (inputMode === 'text') {
      setTextDraft(question.inspire);
      return;
    }
    setShowVoiceHint(current => !current);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <p className="eyebrow">Six questions · two everyday topics</p>
        <h1>English Conversation Coach</h1>
        <p>Practice real conversations and receive CEFR feedback on every answer.</p>
      </header>

      <main className="conversation-layout">
        <section className="conversation-card" aria-labelledby="current-topic">
          <div className="conversation-heading">
            <div>
              <p>Current topic</p>
              <h2 id="current-topic">{complete ? 'Conversation complete' : question.topic}</h2>
            </div>
            <span>{complete ? '6 of 6' : `${questionIndex + 1} of ${questions.length}`}</span>
          </div>

          <div ref={messageListRef} className="message-list" aria-live="polite">
            {messages.map((message, index) => (
              <article key={`${index}-${message.text}`} className={`message ${message.role}`}>
                <p className="message-author">{message.role === 'coach' ? 'Coach' : 'You'}</p>
                <p>{message.text}</p>
                {message.evaluation && <ConversationFeedback evaluation={message.evaluation} inputMode={message.inputMode} />}
              </article>
            ))}
          </div>

          {complete ? (
            <div className="completion-actions">
              <button type="button" className="send-button" onClick={reset}>Start Again</button>
            </div>
          ) : (
            <ConversationInput
              inputMode={inputMode}
              onInputModeChange={setInputMode}
              textDraft={textDraft}
              onTextChange={setTextDraft}
              voiceTranscript={voiceTranscript}
              onVoiceChange={setVoiceTranscript}
              inspire={question.inspire}
              showVoiceHint={showVoiceHint}
              onInspire={handleInspire}
              onSubmit={submitResponse}
              isLoading={isLoading}
              error={error}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
