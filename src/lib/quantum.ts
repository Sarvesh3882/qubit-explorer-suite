// Minimal statevector simulator for the QUBIT composer.

export type GateType =
  | "H"
  | "X"
  | "Y"
  | "Z"
  | "RX"
  | "RY"
  | "RZ"
  | "CNOT"
  | "SWAP"
  | "MEASURE"
  | "BARRIER";

export interface Op {
  id: string;
  type: GateType;
  col: number;
  /** primary wire (control for CNOT, first wire for SWAP) */
  q: number;
  /** secondary wire for two-qubit gates */
  q2?: number;
  angle?: number;
}

export interface Circuit {
  qubits: number;
  cols: number;
  ops: Op[];
}

export const GATE_META: Record<
  GateType,
  { label: string; kind: "single" | "double" | "meta"; angled?: boolean; hint: string }
> = {
  H: { label: "H", kind: "single", hint: "Hadamard — creates superposition" },
  X: { label: "X", kind: "single", hint: "Pauli-X — bit flip" },
  Y: { label: "Y", kind: "single", hint: "Pauli-Y — bit + phase flip" },
  Z: { label: "Z", kind: "single", hint: "Pauli-Z — phase flip" },
  RX: { label: "RX", kind: "single", angled: true, hint: "Rotation about X" },
  RY: { label: "RY", kind: "single", angled: true, hint: "Rotation about Y" },
  RZ: { label: "RZ", kind: "single", angled: true, hint: "Rotation about Z" },
  CNOT: { label: "CX", kind: "double", hint: "Controlled-NOT — entangles two wires" },
  SWAP: { label: "SW", kind: "double", hint: "Swap two wires" },
  MEASURE: { label: "M", kind: "meta", hint: "Measure into classical register" },
  BARRIER: { label: "|", kind: "meta", hint: "Barrier — scheduling boundary" },
};

export interface State {
  re: Float64Array;
  im: Float64Array;
  n: number;
}

function zeroState(n: number): State {
  const size = 1 << n;
  const re = new Float64Array(size);
  const im = new Float64Array(size);
  re[0] = 1;
  return { re, im, n };
}

type M2 = [number, number, number, number, number, number, number, number]; // [a.re,a.im,b.re,b.im,c.re,c.im,d.re,d.im]

function singleMatrix(op: Op): M2 | null {
  const s = Math.SQRT1_2;
  const t = op.angle ?? Math.PI / 2;
  const c = Math.cos(t / 2);
  const si = Math.sin(t / 2);
  switch (op.type) {
    case "H":
      return [s, 0, s, 0, s, 0, -s, 0];
    case "X":
      return [0, 0, 1, 0, 1, 0, 0, 0];
    case "Y":
      return [0, 0, 0, -1, 0, 1, 0, 0];
    case "Z":
      return [1, 0, 0, 0, 0, 0, -1, 0];
    case "RX":
      return [c, 0, 0, -si, 0, -si, c, 0];
    case "RY":
      return [c, 0, -si, 0, si, 0, c, 0];
    case "RZ":
      return [Math.cos(-t / 2), Math.sin(-t / 2), 0, 0, 0, 0, Math.cos(t / 2), Math.sin(t / 2)];
    default:
      return null;
  }
}

function applySingle(st: State, q: number, m: M2) {
  const size = 1 << st.n;
  const bit = 1 << q;
  for (let i = 0; i < size; i++) {
    if (i & bit) continue;
    const j = i | bit;
    const ar = st.re[i]!, ai = st.im[i]!, br = st.re[j]!, bi = st.im[j]!;
    st.re[i] = m[0] * ar - m[1] * ai + m[2] * br - m[3] * bi;
    st.im[i] = m[0] * ai + m[1] * ar + m[2] * bi + m[3] * br;
    st.re[j] = m[4] * ar - m[5] * ai + m[6] * br - m[7] * bi;
    st.im[j] = m[4] * ai + m[5] * ar + m[6] * bi + m[7] * br;
  }
}

function applyCnot(st: State, c: number, t: number) {
  const size = 1 << st.n;
  const cb = 1 << c, tb = 1 << t;
  for (let i = 0; i < size; i++) {
    if ((i & cb) && !(i & tb)) {
      const j = i | tb;
      const r = st.re[i]!, im = st.im[i]!;
      st.re[i] = st.re[j]!; st.im[i] = st.im[j]!;
      st.re[j] = r; st.im[j] = im;
    }
  }
}

function applySwap(st: State, a: number, b: number) {
  const size = 1 << st.n;
  const ab = 1 << a, bb = 1 << b;
  for (let i = 0; i < size; i++) {
    const ia = (i & ab) !== 0, ib = (i & bb) !== 0;
    if (ia && !ib) {
      const j = (i & ~ab) | bb;
      const r = st.re[i]!, im = st.im[i]!;
      st.re[i] = st.re[j]!; st.im[i] = st.im[j]!;
      st.re[j] = r; st.im[j] = im;
    }
  }
}

export interface SimResult {
  state: State;
  probabilities: number[];
  labels: string[];
  bloch: { x: number; y: number; z: number }[];
}

export function simulate(circuit: Circuit): SimResult {
  const n = circuit.qubits;
  const st = zeroState(n);
  const ops = [...circuit.ops].sort((a, b) => a.col - b.col);
  for (const op of ops) {
    if (op.type === "BARRIER" || op.type === "MEASURE") continue;
    if (op.type === "CNOT" && op.q2 !== undefined) applyCnot(st, op.q, op.q2);
    else if (op.type === "SWAP" && op.q2 !== undefined) applySwap(st, op.q, op.q2);
    else {
      const m = singleMatrix(op);
      if (m) applySingle(st, op.q, m);
    }
  }
  const size = 1 << n;
  const probabilities: number[] = [];
  const labels: string[] = [];
  for (let i = 0; i < size; i++) {
    probabilities.push(st.re[i]! * st.re[i]! + st.im[i]! * st.im[i]!);
    labels.push(i.toString(2).padStart(n, "0").split("").reverse().join(""));
  }
  const bloch = [];
  for (let q = 0; q < n; q++) {
    let x = 0, y = 0, z = 0;
    const bit = 1 << q;
    for (let i = 0; i < size; i++) {
      const p = st.re[i]! * st.re[i]! + st.im[i]! * st.im[i]!;
      z += (i & bit ? -1 : 1) * p;
      if (!(i & bit)) {
        const j = i | bit;
        // rho01 = a0 * conj(a1)
        const rr = st.re[i]! * st.re[j]! + st.im[i]! * st.im[j]!;
        const ri = st.im[i]! * st.re[j]! - st.re[i]! * st.im[j]!;
        x += 2 * rr;
        y += 2 * ri;
      }
    }
    bloch.push({ x, y, z });
  }
  return { state: st, probabilities, labels, bloch };
}

export function amplitudes(st: State, limit = 16) {
  const size = 1 << st.n;
  const out: { label: string; re: number; im: number; prob: number }[] = [];
  for (let i = 0; i < size && out.length < limit; i++) {
    const p = st.re[i]! * st.re[i]! + st.im[i]! * st.im[i]!;
    if (p < 1e-10) continue;
    out.push({
      label: i.toString(2).padStart(st.n, "0").split("").reverse().join(""),
      re: st.re[i]!,
      im: st.im[i]!,
      prob: p,
    });
  }
  return out;
}

const fmtAngle = (a?: number) => (a ?? Math.PI / 2).toFixed(4);

export function toQiskit(circuit: Circuit): string {
  const lines = [
    "from qiskit import QuantumCircuit",
    "from qiskit.quantum_info import Statevector",
    "",
    `qc = QuantumCircuit(${circuit.qubits}, ${circuit.qubits})`,
    "",
  ];
  const ops = [...circuit.ops].sort((a, b) => a.col - b.col || a.q - b.q);
  for (const op of ops) {
    switch (op.type) {
      case "H": lines.push(`qc.h(${op.q})`); break;
      case "X": lines.push(`qc.x(${op.q})`); break;
      case "Y": lines.push(`qc.y(${op.q})`); break;
      case "Z": lines.push(`qc.z(${op.q})`); break;
      case "RX": lines.push(`qc.rx(${fmtAngle(op.angle)}, ${op.q})`); break;
      case "RY": lines.push(`qc.ry(${fmtAngle(op.angle)}, ${op.q})`); break;
      case "RZ": lines.push(`qc.rz(${fmtAngle(op.angle)}, ${op.q})`); break;
      case "CNOT": lines.push(`qc.cx(${op.q}, ${op.q2})`); break;
      case "SWAP": lines.push(`qc.swap(${op.q}, ${op.q2})`); break;
      case "MEASURE": lines.push(`qc.measure(${op.q}, ${op.q})`); break;
      case "BARRIER": lines.push(`qc.barrier(${op.q})`); break;
    }
  }
  lines.push("", "state = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))", "print(state.probabilities_dict())");
  return lines.join("\n");
}

export function toQpiAI(circuit: Circuit): string {
  const ops = [...circuit.ops].sort((a, b) => a.col - b.col || a.q - b.q);
  const body = ops
    .filter((o) => o.type !== "BARRIER")
    .map((o) => {
      if (o.type === "CNOT") return `    circuit.cnot(control=${o.q}, target=${o.q2})`;
      if (o.type === "SWAP") return `    circuit.swap(${o.q}, ${o.q2})`;
      if (o.type === "MEASURE") return `    circuit.measure(${o.q})`;
      if (o.type === "RX" || o.type === "RY" || o.type === "RZ")
        return `    circuit.${o.type.toLowerCase()}(qubit=${o.q}, theta=${fmtAngle(o.angle)})`;
      return `    circuit.${o.type.toLowerCase()}(qubit=${o.q})`;
    })
    .join("\n");
  return [
    "from qpiai_quantum import Circuit, Runtime",
    "",
    "runtime = Runtime(backend='qpiai-simulator', shots=4096)",
    "",
    `def build() -> Circuit:`,
    `    circuit = Circuit(qubits=${circuit.qubits})`,
    body || "    pass",
    "    return circuit",
    "",
    "result = runtime.execute(build())",
    "print(result.counts)",
  ].join("\n");
}

/** Very small Qiskit parser so the code editor can push changes back to the canvas. */
export function parseQiskit(code: string, fallback: Circuit): Circuit {
  const qubitMatch = code.match(/QuantumCircuit\(\s*(\d+)/);
  const qubits = qubitMatch ? Math.min(6, Math.max(1, parseInt(qubitMatch[1]!, 10))) : fallback.qubits;
  const ops: Op[] = [];
  const nextCol = new Array(qubits).fill(0);
  let uid = 0;
  const push = (type: GateType, q: number, q2?: number, angle?: number) => {
    if (q >= qubits || (q2 !== undefined && q2 >= qubits)) return;
    const col = q2 === undefined ? nextCol[q]! : Math.max(nextCol[q]!, nextCol[q2]!);
    ops.push({
      id: `p${uid++}`,
      type,
      q,
      col,
      ...(q2 === undefined ? {} : { q2 }),
      ...(angle === undefined ? {} : { angle }),
    });
    nextCol[q] = col + 1;
    if (q2 !== undefined) nextCol[q2] = col + 1;
  };
  for (const raw of code.split("\n")) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^qc\.(h|x|y|z)\(\s*(\d+)\s*\)/))) push(m[1]!.toUpperCase() as GateType, +m[2]!);
    else if ((m = line.match(/^qc\.(rx|ry|rz)\(\s*([-\d.]+)\s*,\s*(\d+)\s*\)/)))
      push(m[1]!.toUpperCase() as GateType, +m[3]!, undefined, parseFloat(m[2]!));
    else if ((m = line.match(/^qc\.cx\(\s*(\d+)\s*,\s*(\d+)\s*\)/))) push("CNOT", +m[1]!, +m[2]!);
    else if ((m = line.match(/^qc\.swap\(\s*(\d+)\s*,\s*(\d+)\s*\)/))) push("SWAP", +m[1]!, +m[2]!);
    else if ((m = line.match(/^qc\.measure\(\s*(\d+)/))) push("MEASURE", +m[1]!);
    else if ((m = line.match(/^qc\.barrier\(\s*(\d+)/))) push("BARRIER", +m[1]!);
  }
  const cols = Math.max(fallback.cols, ...ops.map((o) => o.col + 2), 10);
  return { qubits, cols, ops };
}
