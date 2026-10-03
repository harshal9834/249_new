import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Create a simple ErrorBoundary wrapper component inside App.tsx or just add it to the top
error_boundary_code = """class SimulatorErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Simulator Crash Log:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 border border-red-500 bg-red-50 text-red-700 m-6 rounded-lg">
          <h2 className="text-lg font-bold mb-2">Simulator Component Crashed</h2>
          <pre className="text-xs overflow-auto bg-white p-4 border border-red-200">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

"""

# Inject before `export default function App()`
if "class SimulatorErrorBoundary" not in app_content:
    app_content = app_content.replace(
        "export default function App() {", 
        error_boundary_code + "export default function App() {"
    )

# Wrap SimulatorControlCenter in ErrorBoundary
sim_render_old = """        {activeModule === 'simulator' && (
          <SimulatorControlCenter />
        )}"""
sim_render_new = """        {activeModule === 'simulator' && (
          <SimulatorErrorBoundary>
            <SimulatorControlCenter />
          </SimulatorErrorBoundary>
        )}"""

app_content = app_content.replace(sim_render_old, sim_render_new)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
