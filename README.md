# Qubit Craft Studio

Qubit is a AI-Based Interactive Quantum Learning & Simulation Platform

whats i want in it

A module almost swhould remble to this map like image attached the module layur should look like the wo attached images

this module will have all the knolwedge info related to quantu computing algo etc and a space for vedio smulation where any vedio simulation works

next a compose it should be like the attached composer image its should be interactive but the ctch is rather than classic composer

ours is diff we dont use qasm we are using qiskit and qpiai

for more qubit and complex calculations 


QUBIT Interactive Composer & Engine EditorVisual Drag-and-Drop Grid: Gate palette containing $H, X, Y, Z, \text{CNOT}, \text{SWAP}, R_x, R_y, R_z$, measurements, and barrier operations.Multi-Engine Code Editor: Toggle views between Qiskit Python, QpiAI Optimization Scripts,. Features bi-directional synchronization (modifying the canvas updates code, and editing code re-renders the canvas).Analytics Panel: Real-time probability histograms, statevector matrix displays, and interactive 3D Bloch sphere / Q-Sphere renderings.

next Algorithm Experimentation & Hybrid Optimization PlaygroundDual Engine Selector: Toggle between Gate-Based QAOA/VQE, D-Wave Quantum Annealing/QUBO, and classical solvers (CPLEX, SciPy).Industry Templates & Parameter Builder: Pre-built configurations for Logistics (TSP), Finance (Portfolio Optimization), and Graph Theory (Max-Cut). Interactive QUBO matrix input ($h_i, J_{ij}$) and variational parameter sliders ($p$-steps, annealing schedules).Benchmarking Suite: Real-time energy convergence graphs, bitstring probability distributions, execution speed (ms), and solution quality metrics.

Origin Pilot Hardware OS & Infrastructure HubActive QPU Fleet Telemetry: Live monitoring of physical QPUs and classical HPC nodes. Displays $T_1 / T_2$ coherence times and gate error heatmaps.Orchestrator & Task Dispatcher: Multi-tenant queue management, dynamic decoupling pulse toggles, Zero-Noise Extrapolation (ZNE) mitigation controls, and hardware token usage tracking.

next Circuit-Aware AI Tutor & Dynamic Manim Visualizer

AST + RAG Grounded Intelligence: Line-by-line code inspection using AST linters mapped to official SDK documentation for 0% AI hallucination.

Dynamic Manim Generation: Generates on-the-fly animated vector graphics directly inside the chatbot window to visually explain conceptual questions or circuit operations.

next Turnkey Instructor Dashboard & Assessment

Classroom Analytics: Student roster tracking, progress heatmaps, automated grading engines for coding Katas, and assignment analytics.

sources :

IBM composerhttps://quantum.cloud.ibm.com/composer but remember ours one is diff and works on idff framework

https://www.pennylane.ai/codebook/learning-paths
https://www.manim.community/
https://originqc.com/blogs/origin-pilot-download
https://www.ibm.com/quantum/qiskit
https://www.qpiai.tech/

What should the first working MVP prioritize?

Learning map + interactive composer + analytics preview (Recommended): delivers the clearest end-to-end Qubit experience; Learning map only with module detail pages; Composer + code editor + analytics only; Full multi-area dashboard shell for all five product areas

Which interaction level should the first composer support?

Clickable gate palette, qubit grid, Qiskit code preview, and simulated analytics; Drag-and-drop gates with editable code synchronization; Full Qiskit/QpiAI execution with real backend calculations

What visual direction should Qubit use?

Split approach: illustrated light learning map and dark composer workspace; it shouldnt be blue neon glow it should a porofessional proper ui

Which external integrations should be connected now?

Qiskit/QpiAI APIs, if you provide credentials and exact endpoints; AI tutor / Manim generation, if you provide the required provider credentials

Should the first release include accounts and instructor roles?

No; single-user demo workspac


the ui should not be blue neon glow aiis use proper desing instruction and use professionals colours and esign layout

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://qubit-explorer-suite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e3f32d99-bc19-4e5e-ab51-60d90c6a2160).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
