import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./src/App.jsx', import.meta.url), 'utf8');

test('stages Alex introduction before questions', () => {
  assert.match(source, /const \[messages, setMessages\] = useState\(\[\]\)/);
  assert.match(source, /const \[isReady, setIsReady\] = useState\(false\)/);
  assert.match(source, /await wait\(INTRO_DELAY\);[\s\S]*setMessages\(\[introduction\]\);[\s\S]*await wait\(FIRST_QUESTION_DELAY\);[\s\S]*setMessages\(initialMessages\)/);
  assert.match(source, /isReady \? \([\s\S]*<ConversationInput/);
});

test('stages each next question after the current coach reply', () => {
  const moveForward = source.match(/const moveForward = async[\s\S]*?\n  };/)?.[0] || '';
  const completion = moveForward.indexOf('if (nextIndex >= questions.length)');
  const delay = moveForward.indexOf('nextQuestionTimerRef.current = setTimeout(resolve, NEXT_QUESTION_DELAY)');
  const nextQuestion = moveForward.indexOf('setMessages([...nextMessages, { role: \'coach\', text: nextText }])');
  assert.ok(completion >= 0 && completion < delay);
  assert.ok(delay < nextQuestion);
  assert.match(source, /useEffect\(\(\) => \(\) => clearTimeout\(nextQuestionTimerRef\.current\), \[\]\)/);
});
