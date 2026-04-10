interface DefineApplicationScopeStepProps {
  selectedRole: string | null;
  selectedScopes: Set<string>;
  onScopeToggle: (scopeId: string) => void;
}

const DefineApplicationScopeStep = (
  { selectedRole, selectedScopes, onScopeToggle }: DefineApplicationScopeStepProps,
) => {
  // Placeholder for Step 2 - "Define Application Scope"
  // This will be implemented in future iterations
  console.log(selectedRole, selectedScopes, onScopeToggle);

  return <h1>Step 2</h1>;
};

export default DefineApplicationScopeStep;
