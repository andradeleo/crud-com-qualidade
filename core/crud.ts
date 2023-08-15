import fs from "fs";
import { v4 as uuid } from "uuid";
const DB_FILE_PATH = "./core/db";

type UUID = string;

interface Todo {
	id: UUID;
	date: string;
	content: string;
	done: boolean;
}

export function create(content: string): Todo {
	const todo: Todo = {
		id: uuid(),
		date: new Date().toISOString(),
		content,
		done: false,
	};

	const todos: Array<Todo> = [...read(), todo];

	fs.writeFileSync(
		DB_FILE_PATH,
		JSON.stringify(
			{
				todos,
			},
			null,
			2
		)
	);
	return todo;
}

export function read(): Array<Todo> {
	const dbString = fs.readFileSync(DB_FILE_PATH, "utf-8");
	const db = JSON.parse(dbString || "{}");

	if (!db.todos) {
		return [];
	}

	return db.todos;
}

export function update(id: UUID, partialTodo: Partial<Todo>) {
	let updatedTodo;

	const todos = read();

	todos.forEach((currentTodo) => {
		const isToUpdate = currentTodo.id === id;

		if (isToUpdate) {
			updatedTodo = Object.assign(currentTodo, partialTodo);
		}
	});

	fs.writeFileSync(
		DB_FILE_PATH,
		JSON.stringify(
			{
				todos,
			},
			null,
			2
		)
	);

	if (!updatedTodo) {
		throw new Error("Please, provide another ID!");
	}

	return updatedTodo;
}

export function deleteById(id: UUID) {
	const todos = read();

	const todosWithOutOne = todos.filter((todo) => {
		if (id === todo.id) {
			return false;
		}

		return true;
	});

	fs.writeFileSync(
		DB_FILE_PATH,
		JSON.stringify(
			{
				todos: todosWithOutOne,
			},
			null,
			2
		)
	);
}

function CLEAR_DB() {
	fs.writeFileSync(DB_FILE_PATH, "");
}

// [SIMULATION]

CLEAR_DB();

create("Primeira todo");

const segundaTodo = create("Segunda todo");
deleteById(segundaTodo.id);

const terceiraTodo = create("Terceira todo");
update(terceiraTodo.id, {
	content: "Atualizada",
	done: true,
});

create("Ir ao parque.");
create("Levar o doguinho para passear");
