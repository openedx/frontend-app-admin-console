interface DefineApplicationScopeStepProps {
  selectedRole: string | null;
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const DefineApplicationScopeStep = (_props: DefineApplicationScopeStepProps) =>
// Placeholder for Step 2 - "Define Application Scope"
// TODO: implement scope selection UI using selectedRole, selectedScopes, onScopeToggle

  // eslint-disable-next-line implicit-arrow-linebreak
  <h1>Step 2</h1>;
export default DefineApplicationScopeStep;
