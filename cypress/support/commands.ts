/// <reference types="cypress" />

// Custom commands for STEP to SVG converter testing

Cypress.Commands.add('uploadStepFile', (fileName: string) => {
  cy.fixture(fileName).then(fileContent => {
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent),
      fileName: fileName,
      mimeType: 'application/step'
    }, { force: true });
  });
});

Cypress.Commands.add('extractProfile', () => {
  cy.get('button').contains('Extract Profile').should('be.enabled').click();
  cy.get('[data-testid="loading-indicator"]', { timeout: 10000 }).should('not.exist');
});

Cypress.Commands.add('exportSvg', () => {
  cy.get('button').contains('Export SVG').should('be.enabled').click();
  // Wait for export to complete
  cy.get('button').contains('Export SVG').should('not.contain', 'Exporting...');
});

Cypress.Commands.add('validateSvgOutput', () => {
  // This would validate the downloaded SVG file
  // Implementation would depend on how downloads are handled in tests
  cy.window().its('document').then((doc) => {
    // Custom validation logic for SVG content
  });
});

// Add support for file uploads with drag and drop
Cypress.Commands.add('uploadFile', { prevSubject: 'element' }, (subject, fileName) => {
  cy.fixture(fileName, 'base64').then(content => {
    const blob = Cypress.Blob.base64StringToBlob(content);
    const testFile = new File([blob], fileName, { type: 'application/step' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(testFile);

    cy.wrap(subject).trigger('drop', { dataTransfer });
  });
});

// Command to wait for 3D viewer to be ready
Cypress.Commands.add('waitFor3DViewer', () => {
  cy.get('canvas').should('be.visible');
  cy.wait(1000); // Allow time for Three.js to initialize
});

// Command to check for WebGL support
Cypress.Commands.add('checkWebGLSupport', () => {
  cy.window().then((win) => {
    const canvas = win.document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    expect(gl).to.not.be.null;
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      uploadFile(fileName: string): Chainable<Element>;
      waitFor3DViewer(): Chainable<Element>;
      checkWebGLSupport(): Chainable<void>;
    }
  }
}