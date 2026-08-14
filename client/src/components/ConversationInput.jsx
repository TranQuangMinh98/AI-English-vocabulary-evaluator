import { useEffect, useRef, useState } from 'react';

function ConversationInput({
  inputMode,
  onInputModeChange,
  textDraft,
  onTextChange,
  voiceTranscript,
  onVoiceChange,
  inspire,
  showVoiceHint,
  onInspire,
  onSubmit,
  isLoading,
  error
}) {
  const [speechSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const recordingRef = useRef(false);

  const stopRecording = () => {
    recordingRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
    setInterimTranscript('');
  };

  useEffect(() => stopRecording, [inputMode]);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isLoading) return;

    setSpeechError('');
    setInterimTranscript('');
    const recognition = new SpeechRecognition();
    let finalTranscript = '';

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const words = event.results[index][0].transcript;
        if (event.results[index].isFinal) finalTranscript += `${words} `;
        else interim += words;
      }
      onVoiceChange(finalTranscript.trim());
      setInterimTranscript(interim);
    };
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') setSpeechError('Voice input stopped. Check microphone access and try again.');
      stopRecording();
    };
    recognition.onend = () => {
      if (recordingRef.current) recognition.start();
      else setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recordingRef.current = true;
    setIsRecording(true);
    recognition.start();
  };

  const submit = (event) => {
    event.preventDefault();
    if (isLoading) return;
    if (inputMode === 'voice') stopRecording();
    onSubmit(inputMode === 'text' ? textDraft : voiceTranscript);
  };

  const recordAgain = () => {
    onVoiceChange('');
    startRecording();
  };

  const draft = inputMode === 'text' ? textDraft : voiceTranscript;

  return (
    <section className="composer" aria-label="Your response">
      <div className="mode-switch" aria-label="Input mode">
        <button
          type="button"
          className={inputMode === 'text' ? 'active' : ''}
          aria-pressed={inputMode === 'text'}
          onClick={() => onInputModeChange('text')}
        >
          Type
        </button>
        <button
          type="button"
          className={inputMode === 'voice' ? 'active' : ''}
          aria-pressed={inputMode === 'voice'}
          disabled={!speechSupported}
          title={speechSupported ? '' : 'Voice input needs Chrome, Edge, or Safari.'}
          onClick={() => onInputModeChange('voice')}
        >
          Speak
        </button>
      </div>

      {!speechSupported && <p className="support-note">Voice input needs Chrome, Edge, or Safari.</p>}

      <form onSubmit={submit}>
        {inputMode === 'text' ? (
          <label className="response-field">
            <span>Your answer</span>
            <textarea
              value={textDraft}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="Write your answer in English…"
              rows="4"
              maxLength="2001"
              disabled={isLoading}
            />
          </label>
        ) : (
          <div className="voice-panel">
            {isRecording ? (
              <>
                <span className="recording-label"><i /> Listening…</span>
                <p>{voiceTranscript || interimTranscript || 'Start speaking when you are ready.'}</p>
                <button type="button" className="quiet-button" onClick={stopRecording}>Stop recording</button>
              </>
            ) : voiceTranscript ? (
              <>
                <span className="field-label">Your transcript</span>
                <p>{voiceTranscript}</p>
                <button type="button" className="quiet-button" onClick={recordAgain} disabled={isLoading}>Record again</button>
              </>
            ) : (
              <button type="button" className="record-button" onClick={startRecording} disabled={isLoading}>
                <span aria-hidden="true">●</span> Start recording
              </button>
            )}
          </div>
        )}

        {(error || speechError) && <p className="input-error" role="alert">{error || speechError}</p>}
        {draft.length >= 1800 && <p className="character-count">{draft.length} / 2,000 characters</p>}

        <div className="composer-actions">
          <div className="inspire-wrap">
            <button
              type="button"
              className="inspire-button"
              title={inputMode === 'text' ? 'Fill in an answer idea' : 'Show an answer idea'}
              aria-expanded={inputMode === 'voice' ? showVoiceHint : undefined}
              aria-controls={inputMode === 'voice' ? 'inspire-hint' : undefined}
              onClick={onInspire}
            >
              Inspire
            </button>
            {inputMode === 'voice' && showVoiceHint && (
              <p id="inspire-hint" className="inspire-hint" role="status">{inspire}</p>
            )}
          </div>
          <button type="submit" className="send-button" disabled={isLoading || isRecording}>
            {isLoading ? 'Working…' : 'Send answer'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ConversationInput;
