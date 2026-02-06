import { styles } from '../styles';

export function DemoHeader() {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Three.js Viewer Demo</h1>
      <p style={styles.subtitle}>A modular 3D model viewer component for React</p>
    </header>
  );
}
