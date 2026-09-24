/**
 * Service Counter Scenario Manager
 * Controls Bank Teller, Hospital Triage, and Civic Government workflows,
 * quick staff reply triggers, and automated interactive simulation.
 */

import { SERVICE_SCENARIOS, VOCABULARY } from '../data/vocabulary.js';

export class ScenarioManager {
  constructor(onScenarioChange, onSimulationStep) {
    this.scenarios = SERVICE_SCENARIOS;
    this.activeScenario = SERVICE_SCENARIOS.BANK;
    this.onScenarioChange = onScenarioChange;
    this.onSimulationStep = onSimulationStep;

    this.isSimulating = false;
    this.simulationIndex = 0;
    this.simulationTimer = null;
  }

  setScenario(scenarioId) {
    const key = Object.keys(this.scenarios).find(k => this.scenarios[k].id === scenarioId);
    if (key) {
      this.activeScenario = this.scenarios[key];
      this.stopSimulation();
      if (this.onScenarioChange) {
        this.onScenarioChange(this.activeScenario);
      }
    }
  }

  getActiveScenario() {
    return this.activeScenario;
  }

  getQuickReplies() {
    return this.activeScenario.quickStaffReplies || [];
  }

  /**
   * Start hands-free automatic dialogue simulation for evaluations and demos
   */
  startSimulation() {
    this.isSimulating = true;
    this.simulationIndex = 0;
    this._runNextSimulationStep();
  }

  stopSimulation() {
    this.isSimulating = false;
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  _runNextSimulationStep() {
    if (!this.isSimulating) return;

    const dialogue = this.activeScenario.sampleDialogue;
    if (!dialogue || this.simulationIndex >= dialogue.length) {
      this.isSimulating = false;
      return;
    }

    const step = dialogue[this.simulationIndex];
    this.simulationIndex++;

    if (this.onSimulationStep) {
      this.onSimulationStep(step);
    }

    // Schedule next step in conversation (approx 3.5s per conversational turn)
    this.simulationTimer = setTimeout(() => {
      this._runNextSimulationStep();
    }, 3600);
  }
}
