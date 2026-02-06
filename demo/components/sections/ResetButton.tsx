import { styles } from '../../styles';

export function ResetButton(props: { onReset: () => void }) {
  const { onReset } = props;
  return (
    <button onClick={onReset} style={{ ...styles.button, backgroundColor: '#333' }}>
      Reset to Defaults
    </button>
  );
}
