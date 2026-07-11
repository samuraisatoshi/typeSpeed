// Domain service: single responsibility of mapping a practice category
// to its dataset and to whether the folder picker should be shown.
// Adding a new category means adding one entry here — no other class
// needs to change (Open/Closed).
class PracticeCategoryProvider {
    constructor(defaultCodeFiles, practiceTexts, typingDrills) {
        this.defaultCodeFiles = defaultCodeFiles || [];
        this.practiceTexts = practiceTexts || {};
        this.typingDrills = typingDrills || {};
    }

    getCategories() {
        return [
            { value: 'code-default', label: 'Código deste projeto (padrão)' },
            { value: 'code-custom', label: 'Minha pasta de código' },
            { value: 'text-en-us', label: 'Texto — English (EN-US)' },
            { value: 'text-pt-br', label: 'Texto — Português (PT-BR)' },
            { value: 'bible-en-us', label: 'Bíblia — English (aleatório, requer internet)' },
            { value: 'bible-pt-br', label: 'Bíblia — Português (aleatório, requer internet)' },
            { value: 'drill-left-hand', label: 'Lição: Mão Esquerda (EN)' },
            { value: 'drill-right-hand', label: 'Lição: Mão Direita (EN)' },
            { value: 'drill-alternating', label: 'Lição: Alternância de Mãos (EN)' }
        ];
    }

    requiresFolderPicker(categoryValue) {
        return categoryValue === 'code-custom';
    }

    // Bible categories fetch a fresh random passage over the network every
    // session instead of reading from a pre-loaded dataset — see
    // BiblePassageService / RandomBiblePassageSelector.
    isLiveFetch(categoryValue) {
        return categoryValue === 'bible-en-us' || categoryValue === 'bible-pt-br';
    }

    getDataset(categoryValue) {
        switch (categoryValue) {
            case 'code-default':
                return this.defaultCodeFiles;
            case 'text-en-us':
                return this.practiceTexts['en-us'] || [];
            case 'text-pt-br':
                return this.practiceTexts['pt-br'] || [];
            case 'drill-left-hand':
                return this.typingDrills['left-hand'] || [];
            case 'drill-right-hand':
                return this.typingDrills['right-hand'] || [];
            case 'drill-alternating':
                return this.typingDrills['alternating'] || [];
            default:
                return null;
        }
    }
}
