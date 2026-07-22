// Shared helpers for the CEFR evaluation routes.

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Extract and parse the JSON object out of a model response.
 * Handles ```json fences and stray text around the object.
 * Throws a SyntaxError (tagged with the raw text) if no valid JSON is found.
 */
function parseEvaluationJson(responseText) {
  if (typeof responseText !== 'string') {
    const err = new SyntaxError('Model response contained no text to parse');
    err.rawResponse = String(responseText);
    throw err;
  }

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```).
  let cleaned = responseText
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    // Fallback: grab the outermost { ... } block and try again.
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (secondError) {
        // fall through to the tagged error below
      }
    }
    const err = new SyntaxError('Model did not return valid JSON');
    err.rawResponse = responseText;
    throw err;
  }
}

/**
 * Classify an error thrown while evaluating and send an appropriate response.
 *
 * - Anthropic/API errors carry an HTTP `status`; we forward a sensible client
 *   status and a specific message.
 * - JSON parse failures mean the upstream model returned malformed output (502).
 * - Everything else is a generic 500.
 *
 * `details` (the real error message) is always included server-side via logging,
 * and included in the response body outside of production so the deployed app
 * doesn't leak internals while local/staging stays debuggable.
 *
 * @param {Error} error
 * @param {import('express').Response} res
 * @param {string} label - human label for the operation, e.g. "text", "audio"
 */
function handleEvaluationError(error, res, label) {
  const status = error?.status; // set by the Anthropic SDK on API errors
  const details = error?.message || String(error);

  console.error(`[${label} evaluation] ${error?.name || 'Error'}: ${details}`);
  if (error?.stack) {
    console.error(error.stack);
  }

  const body = (message, extra = {}) =>
    isProduction() ? { error: message, ...extra } : { error: message, details, ...extra };

  // Malformed JSON from the model.
  if (error instanceof SyntaxError) {
    return res.status(502).json(
      body('The evaluator returned an unexpected response format. Please try again.')
    );
  }

  // Upstream API errors carry an HTTP status.
  if (typeof status === 'number') {
    if (status === 401 || status === 403) {
      return res.status(502).json(
        body('The evaluation service rejected the request (authentication). Please contact support.')
      );
    }
    if (status === 429) {
      return res.status(429).json(
        body('The evaluation service is rate limited right now. Please wait a moment and try again.')
      );
    }
    if (status === 404) {
      return res.status(502).json(
        body('The evaluation service endpoint or model was not found. Check the API configuration.')
      );
    }
    if (status >= 500) {
      return res.status(502).json(
        body('The evaluation service is temporarily unavailable. Please try again shortly.')
      );
    }
    return res.status(502).json(
      body(`The evaluation service returned an error (status ${status}).`)
    );
  }

  // Network/connection errors from the SDK have no status.
  if (error?.name === 'APIConnectionError' || error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    return res.status(502).json(
      body('Could not reach the evaluation service. Please try again shortly.')
    );
  }

  // Unknown/unexpected.
  return res.status(500).json(
    body(`Failed to evaluate ${label}. Please try again.`)
  );
}

module.exports = { parseEvaluationJson, handleEvaluationError, isProduction };
