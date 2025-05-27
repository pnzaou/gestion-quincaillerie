export const setInitialValue = (setValue, initialData) => {
    if (!initialData) return;
    Object.entries(initialData).forEach(([key, value]) => {
        setValue(key, value ?? "");
    });
};
