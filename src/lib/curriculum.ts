export interface Lesson {
  title: string;
  body: string[];
  formula?: string;
}

export interface ModuleNode {
  id: string;
  code: string;
  title: string;
  region: "introduction" | "algorithms" | "hardware" | "optimization";
  x: number; // percent on the map
  y: number;
  lessonCount: number;
  minutes: number;
  summary: string;
  connects: string[];
  lessons: Lesson[];
  simulation: { title: string; caption: string };
}

export const REGIONS: Record<ModuleNode["region"], { label: string; tint: string }> = {
  introduction: { label: "Introduction", tint: "region-intro" },
  algorithms: { label: "Algorithms", tint: "region-algo" },
  optimization: { label: "Optimization", tint: "region-opt" },
  hardware: { label: "Hardware", tint: "region-hw" },
};

export const MODULES: ModuleNode[] = [
  {
    id: "single-qubit",
    code: "SQ",
    title: "Single Qubit States",
    region: "introduction",
    x: 30,
    y: 30,
    lessonCount: 7,
    minutes: 45,
    summary:
      "Amplitudes, normalisation and the Bloch sphere — the vocabulary every other module builds on.",
    connects: ["multi-qubit", "phase-kickback"],
    lessons: [
      {
        title: "The notion of a qubit",
        body: [
          "A classical bit is a binary value: 0 or 1, usually a voltage above or below a threshold. A qubit is a two-level quantum system, and its state is a vector in a two-dimensional complex space spanned by |0> and |1>.",
          "The coefficients alpha and beta are amplitudes. They are complex numbers, and their squared magnitudes give the probability of each measurement outcome.",
        ],
        formula: "|psi> = alpha|0> + beta|1>,   |alpha|^2 + |beta|^2 = 1",
      },
      {
        title: "Normalising a state",
        body: [
          "Any non-zero pair of amplitudes can be turned into a valid quantum state by dividing through by the vector norm. This is the first exercise you will run in the composer: prepare an arbitrary state, then confirm the probabilities sum to one.",
        ],
        formula: "|psi'> = (alpha|0> + beta|1>) / sqrt(|alpha|^2 + |beta|^2)",
      },
      {
        title: "Rotations on the Bloch sphere",
        body: [
          "Every single-qubit operation is a rotation of the Bloch vector. RX, RY and RZ rotate about their respective axes by an angle theta; H maps the Z axis onto the X axis, which is why it turns a definite state into an even superposition.",
        ],
      },
    ],
    simulation: {
      title: "Bloch rotation walkthrough",
      caption:
        "Animated Manim-style sweep of RY(theta) from |0> to |+> with live amplitude readout.",
    },
  },
  {
    id: "multi-qubit",
    code: "MQ",
    title: "Multi-Qubit Systems",
    region: "introduction",
    x: 52,
    y: 44,
    lessonCount: 6,
    minutes: 55,
    summary:
      "Tensor products, entanglement and why the statevector grows as 2^n. Bell pairs built in the composer.",
    connects: ["entanglement", "grover", "qft"],
    lessons: [
      {
        title: "Composing registers",
        body: [
          "Two qubits live in a four-dimensional space. The basis states are the tensor products |00>, |01>, |10>, |11>. Adding a qubit doubles the size of the statevector — this exponential growth is the resource quantum computers exploit and the reason classical simulation stalls around 40 qubits.",
        ],
        formula: "|psi_AB> = |psi_A> (x) |psi_B>",
      },
      {
        title: "Entanglement and the Bell pair",
        body: [
          "Apply H to wire 0, then CNOT with wire 0 as control and wire 1 as target. The result cannot be written as a product of two single-qubit states: measuring one wire instantly determines the other.",
        ],
        formula: "|Phi+> = (|00> + |11>) / sqrt(2)",
      },
    ],
    simulation: {
      title: "Bell pair correlation",
      caption: "Two-wire measurement histogram converging to 50/50 on |00> and |11>.",
    },
  },
  {
    id: "phase-kickback",
    code: "PF",
    title: "Phase & Interference",
    region: "introduction",
    x: 40,
    y: 57,
    lessonCount: 5,
    minutes: 40,
    summary: "Relative phase, phase kickback and constructive/destructive interference.",
    connects: ["qft"],
    lessons: [
      {
        title: "Global vs relative phase",
        body: [
          "A global phase is unobservable. A relative phase between basis states is not — it changes interference patterns once you rotate back into the computational basis. This is the mechanism behind nearly every quantum speed-up.",
        ],
      },
      {
        title: "Phase kickback",
        body: [
          "Applying a controlled-U with an eigenstate on the target wire imprints the eigenvalue phase onto the control wire. Phase estimation, Shor's algorithm and Grover's oracle all rest on this single trick.",
        ],
      },
    ],
    simulation: {
      title: "Interference fringes",
      caption: "Sweep RZ(phi) inside an H-RZ-H sandwich and watch the outcome probability oscillate.",
    },
  },
  {
    id: "entanglement",
    code: "TE",
    title: "Teleportation",
    region: "introduction",
    x: 60,
    y: 62,
    lessonCount: 4,
    minutes: 35,
    summary: "Shared entanglement plus two classical bits transfers an unknown state.",
    connects: ["error-correction"],
    lessons: [
      {
        title: "The protocol",
        body: [
          "Alice and Bob share a Bell pair. Alice entangles her unknown qubit with her half, measures both wires, and sends the two classical bits to Bob, who applies a conditional X and Z. No information travels faster than light: the classical channel is required.",
        ],
      },
    ],
    simulation: {
      title: "Three-wire teleportation",
      caption: "Step-through animation with conditional corrections highlighted per branch.",
    },
  },
  {
    id: "grover",
    code: "SH",
    title: "Search & Amplitude Amplification",
    region: "algorithms",
    x: 34,
    y: 14,
    lessonCount: 5,
    minutes: 60,
    summary: "Grover's oracle, the diffusion operator and the quadratic speed-up.",
    connects: ["qft"],
    lessons: [
      {
        title: "Oracle and diffuser",
        body: [
          "Grover alternates a phase oracle that marks the solution with a diffusion operator that reflects about the mean amplitude. Each iteration rotates the state vector closer to the marked item; the optimal number of iterations scales as the square root of the search space.",
        ],
        formula: "k ~ (pi/4) * sqrt(N)",
      },
    ],
    simulation: {
      title: "Amplitude amplification",
      caption: "Bar chart animation showing the marked amplitude growing over successive iterations.",
    },
  },
  {
    id: "qft",
    code: "QFT",
    title: "Quantum Fourier Transform",
    region: "algorithms",
    x: 55,
    y: 12,
    lessonCount: 6,
    minutes: 70,
    summary: "The QFT circuit, controlled phase rotations and its role in phase estimation.",
    connects: ["qpe"],
    lessons: [
      {
        title: "From DFT to QFT",
        body: [
          "The QFT is the discrete Fourier transform acting on amplitudes. Implemented with Hadamards and controlled phase rotations, it needs only O(n^2) gates where the classical FFT needs O(n 2^n) operations on the same amplitude list.",
        ],
      },
    ],
    simulation: {
      title: "QFT spectrum",
      caption: "Periodic input state transformed into a sharp frequency peak.",
    },
  },
  {
    id: "qpe",
    code: "QPE",
    title: "Phase Estimation",
    region: "algorithms",
    x: 72,
    y: 20,
    lessonCount: 4,
    minutes: 50,
    summary: "Estimating eigenvalues — the engine inside Shor and quantum chemistry.",
    connects: [],
    lessons: [
      {
        title: "Reading a phase into a register",
        body: [
          "Controlled powers of U kick eigenvalue phases into an ancilla register; an inverse QFT converts those phases into a binary readout. Precision is set by the number of ancilla wires.",
        ],
      },
    ],
    simulation: {
      title: "Ancilla readout",
      caption: "Register histogram sharpening as ancilla count increases.",
    },
  },
  {
    id: "qaoa",
    code: "QA",
    title: "QAOA & Variational Methods",
    region: "optimization",
    x: 24,
    y: 78,
    lessonCount: 6,
    minutes: 65,
    summary: "Cost and mixer Hamiltonians, p-steps, and the classical optimisation loop.",
    connects: ["annealing"],
    lessons: [
      {
        title: "The hybrid loop",
        body: [
          "A parameterised circuit prepares a trial state; the expectation value of the cost Hamiltonian is measured; a classical optimiser updates the parameters. Increasing p improves the ansatz at the cost of circuit depth and noise exposure.",
        ],
        formula: "|gamma, beta> = prod_p e^{-i beta_p H_M} e^{-i gamma_p H_C} |+>^n",
      },
    ],
    simulation: {
      title: "Energy convergence",
      caption: "Live convergence curve across optimiser iterations for a Max-Cut instance.",
    },
  },
  {
    id: "annealing",
    code: "DM",
    title: "Annealing & QUBO",
    region: "optimization",
    x: 46,
    y: 86,
    lessonCount: 5,
    minutes: 55,
    summary: "Ising models, QUBO matrices and annealing schedules for logistics and finance.",
    connects: [],
    lessons: [
      {
        title: "Mapping problems to QUBO",
        body: [
          "Portfolio selection, travelling salesman and Max-Cut all reduce to minimising a quadratic form over binary variables. Linear terms h_i bias individual variables; coupling terms J_ij encode the pairwise constraints.",
        ],
        formula: "E(s) = sum_i h_i s_i + sum_{i<j} J_ij s_i s_j",
      },
    ],
    simulation: {
      title: "Annealing schedule",
      caption: "Transverse-field ramp with ground-state occupancy tracked over time.",
    },
  },
  {
    id: "error-correction",
    code: "EC",
    title: "Noise & Error Correction",
    region: "hardware",
    x: 78,
    y: 62,
    lessonCount: 5,
    minutes: 60,
    summary: "T1/T2, gate error, repetition and surface codes, and ZNE mitigation.",
    connects: ["hardware-os"],
    lessons: [
      {
        title: "Where the errors come from",
        body: [
          "T1 is energy relaxation, T2 is dephasing. Both bound how deep a circuit can run before the signal is lost. Error mitigation (zero-noise extrapolation, dynamical decoupling) buys usable results before full fault tolerance arrives.",
        ],
      },
    ],
    simulation: {
      title: "Decoherence decay",
      caption: "Fidelity decay curve against circuit depth with and without ZNE.",
    },
  },
  {
    id: "hardware-os",
    code: "HS",
    title: "Hardware & Orchestration",
    region: "hardware",
    x: 86,
    y: 36,
    lessonCount: 4,
    minutes: 40,
    summary: "QPU fleets, transpilation targets, queueing and hybrid HPC dispatch.",
    connects: [],
    lessons: [
      {
        title: "From circuit to pulse",
        body: [
          "A logical circuit is transpiled to the native gate set and coupling graph of a specific QPU, scheduled against calibration data, then dispatched as pulses. The orchestrator decides which jobs run on quantum hardware and which fall back to classical HPC nodes.",
        ],
      },
    ],
    simulation: {
      title: "Dispatch timeline",
      caption: "Queue occupancy across a simulated four-QPU fleet.",
    },
  },
];

export const PATHS = [
  {
    name: "Foundations of Quantum Computing",
    modules: ["single-qubit", "multi-qubit", "phase-kickback", "entanglement"],
  },
  { name: "Foundations of Quantum Algorithms", modules: ["grover", "qft", "qpe"] },
  { name: "Optimisation & Industry Problems", modules: ["qaoa", "annealing"] },
  { name: "Hardware, Noise & Operations", modules: ["error-correction", "hardware-os"] },
];

export const getModule = (id: string) => MODULES.find((m) => m.id === id);
