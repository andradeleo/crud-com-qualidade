export {};

describe("/ - todos feed", () => {
	it("when load, renders the page", () => {
		cy.visit("http://localhost:3000");
	});

	it.only("when create a new todo, it must appears in the screen", () => {
		// ??? interceptação
		cy.intercept("POST", `${"http://localhost:3000"}/api/todos`, (request) => {
			request.reply({
				statusCode: 201,
				body: {
					todo: {
						id: "e2e230bb-b7f7-4f56-b553-777cda76f9d7",
						date: "2023-08-15T23:26:53.180Z",
						content: "Test todo",
						done: false,
					},
				},
			});
		}).as("createTodo");

		// abrir a página
		// selecionar o input de criar nova todo
		// digitar no input de criar nova todo
		// clicar no botao
		// checar se na página surgiu um novo elemento

		cy.visit("http://localhost:3000");
		cy.get("input[name='add-todo']").type("Test todo");

		cy.get("[aria-label='Adicionar novo item']").click();

		cy.get("table > tbody").contains("Test todo");
	});
});
