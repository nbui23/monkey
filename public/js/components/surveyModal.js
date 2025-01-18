class SurveyModal {
    constructor() {
        this.modal = document.getElementById('surveyModal');
        this.content = document.getElementById('surveyContent');
        this.currentSurvey = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.close();
            }
        });
    }

    async show(cartItems, userActivity) {
        return new Promise(async (resolve) => {
            if (!cartItems || cartItems.length === 0) {
                resolve();
                return;
            }

            // Get the last purchased product for the survey
            const lastItem = cartItems[cartItems.length - 1];
            const product = products.find(p => p.id === lastItem.productId);

            if (!product) {
                resolve();
                return;
            }

            try {
                // Get survey questions based on product and user activity
                this.currentSurvey = await surveyService.generateCustomSurvey(product, userActivity);

                // If custom survey generation fails, fall back to basic product survey
                if (!this.currentSurvey) {
                    this.currentSurvey = await surveyService.generateSurvey(product);
                }

                this.renderSurvey(this.currentSurvey);
                this.modal.style.display = 'block';

                // Store resolve function to call it when survey is completed
                this._resolveShow = resolve;
            } catch (error) {
                console.error('Error generating survey:', error);
                resolve();
            }
        });
    }

    renderSurvey(survey) {
        if (!survey) return;

        this.content.innerHTML = `
            <div class="survey-question">${survey.question}</div>
            <div class="survey-options">
                ${survey.options.map(option => `
                    <div class="survey-option" onclick="surveyModal.handleResponse('${option.replace(/'/g, "\\'")}')">
                        ${option}
                    </div>
                `).join('')}
            </div>
            <button class="skip-survey-btn" onclick="surveyModal.skip()">
                Skip Survey
            </button>
        `;
    }

    handleResponse(response) {
        if (!this.currentSurvey) return;

        surveyService.saveSurveyResponse({
            question: this.currentSurvey.question,
            response: response,
            timestamp: new Date()
        });

        // Show thank you message
        this.content.innerHTML = `
            <div class="survey-thank-you">
                <h3>Thank you for your feedback!</h3>
                <p>Your response helps us improve our service.</p>
            </div>
        `;

        // Close modal after delay
        setTimeout(() => {
            this.close();
        }, 2000);
    }

    skip() {
        this.close();
    }

    close() {
        this.modal.style.display = 'none';
        this.currentSurvey = null;

        // Dispatch survey completion event
        document.dispatchEvent(new CustomEvent('survey-completed'));

        // Resolve the show promise if it exists
        if (this._resolveShow) {
            this._resolveShow();
            this._resolveShow = null;
        }
    }
}

// Initialize survey modal
const surveyModal = new SurveyModal();
