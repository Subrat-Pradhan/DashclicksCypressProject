// AI Agent implementation using Q-Learning for Cypress testing
class QLearnAgent {
    constructor() {
        this.qTable = new Map(); // Stores state-action pairs and their Q-values
        this.learningRate = 0.1;
        this.discountFactor = 0.9;
        this.epsilon = 0.2; // Exploration rate
        this.previousState = null;
        this.previousAction = null;
    }

    // Get state representation of current page
    async getState() {
        const elements = await cy.$$('button, a, input, select');
        return elements.map(el => ({
            type: el.tagName.toLowerCase(),
            id: el.id,
            class: el.className,
            text: el.innerText,
            visible: Cypress.$(el).is(':visible')
        }));
    }

    // Get possible actions for current state
    getActions() {
        return cy.get('button, a, input, select').then($elements => {
            const actions = [];
            $elements.each((_, el) => {
                const $el = Cypress.$(el);
                if ($el.is(':visible')) {
                    actions.push({
                        type: 'click',
                        element: el,
                        selector: this.getSelector($el)
                    });
                }
            });
            return actions;
        });
    }

    // Get unique selector for element
    getSelector($el) {
        if ($el.attr('id')) return `#${$el.attr('id')}`;
        if ($el.attr('name')) return `[name="${$el.attr('name')}"]`;
        return $el.prop('tagName').toLowerCase();
    }

    // Choose action using epsilon-greedy strategy
    chooseAction(state) {
        return this.getActions().then(actions => {
            // Exploration: Random action
            if (Math.random() < this.epsilon) {
                return actions[Math.floor(Math.random() * actions.length)];
            }
            
            // Exploitation: Best known action
            let bestAction = null;
            let maxQValue = -Infinity;
            
            for (const action of actions) {
                const stateAction = JSON.stringify({ state, action });
                const qValue = this.qTable.get(stateAction) || 0;
                
                if (qValue > maxQValue) {
                    maxQValue = qValue;
                    bestAction = action;
                }
            }
            
            return bestAction || actions[0];
        });
    }

    // Update Q-value based on reward
    updateQValue(state, action, nextState, reward) {
        const stateAction = JSON.stringify({ state, action });
        const currentQ = this.qTable.get(stateAction) || 0;
        
        // Get max Q-value for next state
        let maxNextQ = 0;
        if (nextState) {
            return this.getActions().then(nextActions => {
                for (const nextAction of nextActions) {
                    const nextStateAction = JSON.stringify({ state: nextState, action: nextAction });
                    const nextQ = this.qTable.get(nextStateAction) || 0;
                    maxNextQ = Math.max(maxNextQ, nextQ);
                }
                
                // Q-learning update formula
                const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
                this.qTable.set(stateAction, newQ);
            });
        }
        
        // If no next state, just update with current reward
        const newQ = currentQ + this.learningRate * (reward - currentQ);
        this.qTable.set(stateAction, newQ);
    }

    // Calculate reward based on various factors
    calculateReward() {
        let reward = 0;
        
        return cy.get('button, a, input, select').then($elements => {
            // Reward for finding new elements
            reward += $elements.length * 0.1;
            
            // Check for errors
            return cy.get('.error-message').should('not.exist').then(() => {
                return reward;
            }).catch(() => {
                return reward - 2; // Penalty for errors
            });
        });
    }

    // Main exploration loop
    explore(baseUrl, maxSteps = 100) {
        let step = 0;
        
        const runStep = () => {
            if (step >= maxSteps) return;
            
            return this.getState()
                .then(currentState => {
                    return this.chooseAction(currentState)
                        .then(action => {
                            if (!action) return;
                            
                            return cy.get(action.selector)
                                .click()
                                .wait(1000) // Wait for page to settle
                                .then(() => {
                                    return this.getState();
                                })
                                .then(nextState => {
                                    return this.calculateReward()
                                        .then(reward => {
                                            this.updateQValue(currentState, action, nextState, reward);
                                            cy.log(`Step ${step + 1}: Reward = ${reward}`);
                                            step++;
                                            return runStep();
                                        });
                                });
                        });
                })
                .catch(error => {
                    cy.log(`Error during exploration: ${error.message}`);
                    step++;
                    return runStep();
                });
        };

        return cy.visit(baseUrl).then(() => runStep());
    }
}

// Create and export a singleton instance
const aiAgent = new QLearnAgent();
module.exports = { aiAgent };
