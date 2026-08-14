import { useEffect, useRef, useState } from 'react';
import questions from '../../shared/conversation-questions.json';
import ConversationFeedback from './components/ConversationFeedback';
import ConversationInput from './components/ConversationInput';

const API_URL = import.meta.env.VITE_API_URL || '';
const INTRO_DELAY = 450;
const FIRST_QUESTION_DELAY = 700;
const NEXT_QUESTION_DELAY = 650;
const introduction = { role: 'coach', text: 'Hi, I’m Alex, your English conversation coach. Let’s practice together.' };
const initialMessages = [
  introduction,
  { role: 'coach', text: questions[0].question }
];

function App() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [conversationResponses, setConversationResponses] = useState([]);
  const [unrelatedCount, setUnrelatedCount] = useState(0);
  const [inputMode, setInputMode] = useState('text');
  const [textDraft, setTextDraft] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceHint, setShowVoiceHint] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [introRun, setIntroRun] = useState(0);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [finalEvaluation, setFinalEvaluation] = useState(null);
  const messageListRef = useRef(null);
  const nextQuestionTimerRef = useRef(null);
  const question = questions[questionIndex];
  const displayedMessages = pendingMessage ? [...messages, pendingMessage] : messages;

  useEffect(() => {
    let cancelled = false;
    let timer;
    const wait = (duration) => new Promise(resolve => { timer = setTimeout(resolve, duration); });

    (async () => {
      await wait(INTRO_DELAY);
      if (cancelled) return;
      setMessages([introduction]);
      await wait(FIRST_QUESTION_DELAY);
      if (cancelled) return;
      setMessages(initialMessages);
      setIsReady(true);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [introRun]);

  useEffect(() => {
    messageListRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }, [messages, pendingMessage, isLoading]);

  useEffect(() => () => clearTimeout(nextQuestionTimerRef.current), []);

  const reset = () => {
    setQuestionIndex(0);
    setMessages([]);
    setPendingMessage(null);
    setConversationResponses([]);
    setUnrelatedCount(0);
    setInputMode('text');
    setTextDraft('');
    setVoiceTranscript('');
    setShowVoiceHint(false);
    setIsLoading(true);
    setIsReady(false);
    setError('');
    setComplete(false);
    setFinalEvaluation(null);
    setIntroRun(current => current + 1);
  };

  const requestFeedback = async (responses) => {
    const feedbackResponse = await fetch(`${API_URL}/api/conversation-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses })
    });
    const feedback = await feedbackResponse.json();
    if (!feedbackResponse.ok) throw new Error(feedback.error || 'The conversation could not be evaluated. Try again.');
    setFinalEvaluation(feedback.evaluation);
  };

  const moveForward = async (nextMessages, nextResponses, prefix = '') => {
    const nextIndex = questionIndex + 1;
    setMessages(nextMessages);
    setConversationResponses(nextResponses);

    if (nextIndex >= questions.length) {
      setMessages([...nextMessages, { role: 'coach', text: 'Let’s finish here. Thanks for practicing with me today!' }]);
      setComplete(true);
      await requestFeedback(nextResponses);
      return;
    }

    await new Promise(resolve => {
      nextQuestionTimerRef.current = setTimeout(resolve, NEXT_QUESTION_DELAY);
    });

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
    setPendingMessage({ role: 'learner', text: response, inputMode });

    try {
      const apiResponse = await fetch(`${API_URL}/api/conversation-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, response, inputMode })
      });
      const data = await apiResponse.json();
      if (!apiResponse.ok) throw new Error(data.error || 'The response could not be processed. Try again.');
      setPendingMessage(null);

      const learnerMessage = { role: 'learner', text: response, inputMode };
      const nextMessages = [...messages, learnerMessage];
      const nextResponses = [...conversationResponses, { questionId: question.id, response, inputMode }];

      if (!data.aligned) {
        if (unrelatedCount === 0) {
          setMessages([...nextMessages, {
            role: 'coach',
            text: `That’s great, but we’re currently talking about ${question.topic}. Let’s get back on track: ${question.question}`
          }]);
          setConversationResponses(nextResponses);
          setUnrelatedCount(1);
        } else {
          await moveForward(nextMessages, nextResponses, 'Let’s move to the next question:');
          setUnrelatedCount(0);
        }
        setTextDraft('');
        setVoiceTranscript('');
        return;
      }

      await moveForward([...nextMessages, { role: 'coach', text: data.acknowledgment }], nextResponses);
      setUnrelatedCount(0);
      setTextDraft('');
      setVoiceTranscript('');
    } catch (requestError) {
      setError(requestError.message || 'The response could not be processed. Try again.');
    } finally {
      setPendingMessage(null);
      setIsLoading(false);
    }
  };

  const retryFeedback = async () => {
    setError('');
    setIsLoading(true);
    try {
      await requestFeedback(conversationResponses);
    } catch (requestError) {
      setError(requestError.message || 'The conversation could not be evaluated. Try again.');
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
        <p>Practice real conversations and receive CEFR feedback when you finish.</p>
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
            {displayedMessages.map((message, index) => (
              <article key={`${index}-${message.text}`} className={`message ${message.role}`}>
                <p className="message-author">{message.role === 'coach' ? 'Alex' : 'You'}</p>
                <p>{message.text}</p>
              </article>
            ))}
            {isLoading && (
              <article className="message coach thinking-message">
                <p className="message-author" aria-hidden="true">Alex</p>
                <p>Alex is thinking<span className="thinking-dots" aria-hidden="true"><i /><i /><i /></span></p>
              </article>
            )}
          </div>

          {complete ? (
            <div className="completion-actions">
              {finalEvaluation ? <ConversationFeedback evaluation={finalEvaluation} /> : (
                !isLoading && <>
                  <p className="input-error" role="alert">{error || 'Feedback is not available yet.'}</p>
                  <button type="button" className="quiet-button" onClick={retryFeedback} disabled={isLoading}>
                    {isLoading ? 'Working…' : 'Retry feedback'}
                  </button>
                </>
              )}
              <button type="button" className="send-button" onClick={reset} disabled={isLoading}>Start Again</button>
            </div>
          ) : isReady ? (
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
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
