
// Hook temporairement désactivé - assurances retirées du projet
export const useAssurances = () => {
  return {
    assurances: [],
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};
