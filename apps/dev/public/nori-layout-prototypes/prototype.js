const promptCopy = {
  register: 'How do I register an agent on Masumi and verify its identity?',
  escrow: 'Show me the escrow payment flow for a human buying an agent service.',
  collaborate: 'How can two agents collaborate and settle payment with Masumi?',
  api: 'Which API endpoints do I need to create a purchase and submit a result?',
};

document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.getAttribute('data-prompt');
    const input = document.querySelector('[data-nori-input]');
    if (input && key && promptCopy[key]) {
      input.value = promptCopy[key];
      input.focus();
    }
  });
});

document.querySelectorAll('[data-demo-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('[data-nori-input]');
    const output = document.querySelector('[data-demo-output]');
    if (!input || !output) return;

    const text = input.value.trim() || 'How does Masumi handle an agent payment?';
    output.innerHTML = `
      <article class="message user">
        <div class="message-bubble">${escapeHtml(text)}</div>
      </article>
      <article class="message nori">
        <span class="chat-avatar" aria-hidden="true">
          <img src="/assets/nori-pfp.png" alt="" />
        </span>
        <div class="message-bubble">
          <span class="answer-label">Nori answer</span>
          I can answer that and show the Masumi job/payment lifecycle around it.
          <div class="source-row">
            <span class="source-pill">Payments</span>
            <span class="source-pill">Agent API</span>
            <span class="source-pill">Registry</span>
          </div>
        </div>
      </article>
      <article class="inline-trace-event done" data-track="registry" aria-label="Masumi trace event: registry verified">
        <span class="trace-marker">1</span>
        <div class="event-copy">
          <div class="event-topline">
            <span class="event-title">
              <span class="event-kind kind-registry">Masumi registry</span>
              <strong>Checking the registry</strong>
            </span>
            <span class="event-status">Done</span>
          </div>
          <p>The registered agent identity and service endpoint are resolved before the purchase is created.</p>
          <div class="event-meta-grid">
            <span><small>Network</small><code>preprod</code></span>
            <span><small>Agent NFT</small><code>policy: 7f8c...nori</code></span>
            <span><small>Service</small><code>docs-answer</code></span>
          </div>
        </div>
      </article>
      <article class="inline-trace-event done" data-track="task" aria-label="Masumi trace event: job placed">
        <span class="trace-marker">2</span>
        <div class="event-copy">
          <div class="event-topline">
            <span class="event-title">
              <span class="event-kind kind-task">Task orchestration</span>
              <strong>Checking availability and placing the job</strong>
            </span>
            <span class="event-status">Done</span>
          </div>
          <p>Nori is available, so the docs question becomes a job with an input hash and expected result.</p>
          <div class="event-meta-grid">
            <span><small>Task</small><code>task_9d24</code></span>
            <span><small>Queue</small><code>available</code></span>
            <span><small>Worker</small><code>nori-docs</code></span>
          </div>
        </div>
      </article>
      <article class="inline-trace-event active" data-track="payment" aria-label="Masumi trace event: payment request noticed">
        <span class="trace-marker">3</span>
        <div class="event-copy">
          <div class="event-topline">
            <span class="event-title">
              <span class="event-kind kind-payment">Masumi payment</span>
              <strong>Payment request noticed</strong>
            </span>
            <span class="event-status">Active</span>
          </div>
          <p>The docs backend creates a real preprod purchase so the user can inspect the lifecycle without paying.</p>
          <div class="event-meta-grid">
            <span><small>Purchase</small><code>preprod-4821</code></span>
            <span><small>Visitor</small><code>0.00 tUSDM</code></span>
            <span><small>Status</small><code>created</code></span>
          </div>
        </div>
      </article>
      <article class="message nori">
        <span class="chat-avatar" aria-hidden="true">
          <img src="/assets/nori-pfp.png" alt="" />
        </span>
        <div class="message-bubble">
          <span class="answer-label">Nori answer</span>
          The agent gets paid after the job result is submitted and the payment service observes settlement. The remaining payment states can continue directly below this answer.
        </div>
      </article>
      <article class="inline-trace-event planned" data-track="payment" aria-label="Masumi trace event: funds will lock">
        <span class="trace-marker">4</span>
        <div class="event-copy">
          <div class="event-topline">
            <span class="event-title">
              <span class="event-kind kind-payment">Masumi payment</span>
              <strong>Funds lock in escrow</strong>
            </span>
            <span class="event-status">Planned</span>
          </div>
          <p>The purchase is funded and locked at the payment contract while the result is validated.</p>
          <div class="event-meta-grid">
            <span><small>Status</small><code>locked</code></span>
            <span><small>Script</small><code>addr_test1...</code></span>
            <span><small>Amount</small><code>demo funded</code></span>
          </div>
        </div>
      </article>
      <article class="inline-trace-event planned" data-track="answer" aria-label="Masumi trace event: result will be submitted">
        <span class="trace-marker">5</span>
        <div class="event-copy">
          <div class="event-topline">
            <span class="event-title">
              <span class="event-kind kind-answer">Nori result</span>
              <strong>Result proof is submitted</strong>
            </span>
            <span class="event-status">Planned</span>
          </div>
          <p>Nori submits answer metadata and a result hash that tie the response to the completed task.</p>
          <div class="event-meta-grid">
            <span><small>Result</small><code>sha256:answer...</code></span>
            <span><small>Citations</small><code>3 docs pages</code></span>
            <span><small>State</small><code>ready</code></span>
          </div>
        </div>
      </article>
      <article class="inline-trace-event planned" data-track="payment" aria-label="Masumi trace event: payment will settle">
        <span class="trace-marker">6</span>
        <div class="event-copy">
          <div class="event-topline">
            <span class="event-title">
              <span class="event-kind kind-payment">Masumi payment</span>
              <strong>Payment settles to the agent</strong>
            </span>
            <span class="event-status">Planned</span>
          </div>
          <p>The payment service observes the final chain state and links the explorer transaction back into this conversation.</p>
          <div class="event-meta-grid">
            <span><small>Status</small><code>settled</code></span>
            <span><small>Explorer</small><code>cardanoscan</code></span>
            <span><small>Agent paid</small><code>true</code></span>
          </div>
        </div>
      </article>
    `;
  });
});

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
