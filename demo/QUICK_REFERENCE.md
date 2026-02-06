# Quick Reference Guide

## 🚀 Quick Start

### Test the Refactored Version

```typescript
// demo/main.tsx
import App from './App.refactored';
```

```bash
npm run dev
```

## 📁 File Locations

### Need to modify...

| Feature | Hook | Component |
|---------|------|-----------|
| Model loading | `hooks/useModelLoader.ts` | `controls/ModelUrlControl.tsx` |
| Pivot point | `hooks/usePivotControl.ts` | `controls/PivotPointControl.tsx` |
| Zoom limits | `hooks/useZoomControl.ts` | `controls/ZoomLimitsControl.tsx` |
| Grid settings | `hooks/useGridControl.ts` | `controls/GridControl.tsx` |
| Camera movement | `hooks/useCameraMovement.ts` | `controls/CameraMovementControl.tsx` |
| Camera animation | `hooks/useCameraAnimation.ts` | `controls/CameraAnimationControl.tsx` |
| Status display | - | `controls/StatusDisplay.tsx` |
| Instructions | - | `controls/ControlsInstructions.tsx` |
| Styling | `styles/theme.ts` | - |
| Layout | - | `components/DemoLayout.tsx` |

## 🎨 Styling

### Change colors:
```typescript
// styles/theme.ts
export const colors = {
  background: { primary: '#1a1a2e', ... },
  text: { primary: '#eaeaea', ... },
  button: { primary: '#e94560', ... },
};
```

### Use theme in component:
```typescript
import { colors, styles as themeStyles } from '../styles/theme';

<button style={themeStyles.button}>Click</button>
<div style={{ color: colors.text.primary }}>Text</div>
```

## 🔧 Adding New Features

### 1. Create a Hook

```typescript
// hooks/useNewFeature.ts
export function useNewFeature() {
  const [value, setValue] = useState(initialValue);
  
  // Business logic here
  
  return { value, setValue, handleAction };
}
```

### 2. Create a Component

```typescript
// components/controls/NewFeatureControl.tsx
import { ControlSection } from './ControlSection';
import { styles as themeStyles } from '../../styles/theme';

export function NewFeatureControl({ value, onChange }) {
  return (
    <ControlSection title="New Feature">
      <input 
        value={value} 
        onChange={e => onChange(e.target.value)}
        style={themeStyles.input}
      />
    </ControlSection>
  );
}
```

### 3. Wire in App

```typescript
// App.refactored.tsx
import { useNewFeature } from './hooks/useNewFeature';
import { NewFeatureControl } from './components/controls/NewFeatureControl';

const App = () => {
  const newFeature = useNewFeature();
  
  return (
    <DemoSidebar>
      <NewFeatureControl 
        value={newFeature.value}
        onChange={newFeature.setValue}
      />
    </DemoSidebar>
  );
};
```

## 🧪 Testing

### Test a Hook

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useNewFeature } from './useNewFeature';

test('should update value', () => {
  const { result } = renderHook(() => useNewFeature());
  
  act(() => {
    result.current.setValue('new value');
  });
  
  expect(result.current.value).toBe('new value');
});
```

### Test a Component

```typescript
import { render, fireEvent } from '@testing-library/react';
import { NewFeatureControl } from './NewFeatureControl';

test('should call onChange', () => {
  const onChange = jest.fn();
  const { getByRole } = render(
    <NewFeatureControl value="" onChange={onChange} />
  );
  
  fireEvent.change(getByRole('textbox'), { target: { value: 'test' } });
  
  expect(onChange).toHaveBeenCalledWith('test');
});
```

## 🔍 Common Tasks

### Add a new control section

```typescript
<ControlSection title="My Section">
  {/* Your controls here */}
</ControlSection>
```

### Add a checkbox

```typescript
<label style={checkboxLabelStyle}>
  <input
    type="checkbox"
    checked={value}
    onChange={(e) => onChange(e.target.checked)}
  />
  Label Text
</label>
```

### Add a number input

```typescript
<div>
  <label style={themeStyles.label}>Label</label>
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={themeStyles.input}
    step="0.1"
  />
</div>
```

### Add a select dropdown

```typescript
<div>
  <label style={themeStyles.label}>Label</label>
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={themeStyles.input}
  >
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
</div>
```

### Add a button

```typescript
<button
  onClick={handleClick}
  disabled={isDisabled}
  style={{
    ...themeStyles.button,
    backgroundColor: colors.button.primary,
  }}
>
  Button Text
</button>
```

### Add a slider

```typescript
<div>
  <label style={themeStyles.label}>
    Label: {value.toFixed(1)}
  </label>
  <input
    type="range"
    min="0"
    max="100"
    step="1"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value))}
    style={{ width: '100%' }}
  />
</div>
```

## 🐛 Debugging

### Check hook state

```typescript
// Add console.log in hook
export function useMyHook() {
  const [value, setValue] = useState(0);
  
  console.log('Hook state:', { value });
  
  return { value, setValue };
}
```

### Check component props

```typescript
// Add console.log in component
export function MyComponent(props) {
  console.log('Component props:', props);
  
  return <div>...</div>;
}
```

### Check TypeScript errors

```bash
npx tsc --noEmit
```

### Check diagnostics in Kiro

Use the `getDiagnostics` tool on specific files.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `ARCHITECTURE.md` | Detailed architecture explanation |
| `ARCHITECTURE_DIAGRAM.md` | Visual diagrams and flows |
| `MIGRATION.md` | How to migrate from old to new |
| `REFACTORING_SUMMARY.md` | High-level summary |
| `QUICK_REFERENCE.md` | This file - quick lookup |

## 🎯 Data Flow Cheat Sheet

```
User Action
    ↓
Component Event Handler
    ↓
Callback Prop (e.g., onChange)
    ↓
Hook Setter (e.g., setValue)
    ↓
State Update
    ↓
useEffect (if needed)
    ↓
Side Effect (e.g., plugin API call)
    ↓
Re-render with new props
    ↓
UI Update
```

## 🔑 Key Principles

1. **Hooks manage state and logic**
2. **Components render UI only**
3. **Props flow down, callbacks flow up**
4. **Theme provides consistent styling**
5. **Each file has one responsibility**

## 💡 Tips

- Use `ControlSection` for consistent section styling
- Import theme styles instead of inline styles
- Keep components small and focused
- Extract complex logic into hooks
- Use TypeScript for type safety
- Add JSDoc comments for documentation

## 🚨 Common Pitfalls

### ❌ Don't do this:

```typescript
// Business logic in component
function MyComponent() {
  const [data, setData] = useState();
  
  useEffect(() => {
    // Complex logic here
  }, []);
  
  return <div>...</div>;
}
```

### ✅ Do this instead:

```typescript
// Logic in hook
function useMyData() {
  const [data, setData] = useState();
  
  useEffect(() => {
    // Complex logic here
  }, []);
  
  return { data };
}

// Component just renders
function MyComponent() {
  const { data } = useMyData();
  return <div>{data}</div>;
}
```

## 📞 Need Help?

1. Check `ARCHITECTURE.md` for design details
2. Check `ARCHITECTURE_DIAGRAM.md` for visual guides
3. Check `MIGRATION.md` for migration issues
4. Look at existing hooks/components for patterns
5. Use TypeScript errors as guidance

---

**Quick Links:**
- [Architecture](./ARCHITECTURE.md)
- [Diagrams](./ARCHITECTURE_DIAGRAM.md)
- [Migration](./MIGRATION.md)
- [Summary](./REFACTORING_SUMMARY.md)
