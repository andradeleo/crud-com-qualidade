import { todoRepository } from "@ui/repository/todo";
import { Todo } from "@ui/schema/todo";
import { z as schema } from "zod";

interface TodoControllerGerParams {
	page: number;
}

async function get({ page }: TodoControllerGerParams) {
	return todoRepository.get({
		page: page || 1,
		limit: 2,
	});
}

function filterTodosByContent<Todo>(
	search: string,
	todos: Array<Todo & { content: string }>
): Todo[] {
	const homeTodos = todos.filter((todo) => {
		const searchNomalized = search.toLowerCase();
		const contentNormalized = todo.content.toLowerCase();
		return contentNormalized.includes(searchNomalized);
	});

	return homeTodos;
}

interface TodoControllerCreateParams {
	content?: string;
	onError: () => void;
	onSuccess: (todo: Todo) => void;
}

function create({ content, onSuccess, onError }: TodoControllerCreateParams) {
	const parsedParams = schema.string().nonempty().safeParse(content);

	if (!parsedParams.success) {
		onError();
		return;
	}

	todoRepository
		.createByContent(parsedParams.data)
		.then((newTodo) => {
			onSuccess(newTodo);
		})
		.catch(() => {
			onError();
		});
}

interface TodoControllerToggleDoneParams {
	id: string;
	updateTodoOnScreen: () => void;
	onError: () => void;
}

function toggleDone({
	id,
	updateTodoOnScreen,
	onError,
}: TodoControllerToggleDoneParams) {
	todoRepository
		.toggleDone(id)
		.then(() => {
			updateTodoOnScreen();
		})
		.catch(() => {
			onError();
		});
}

async function deleteById(id: string): Promise<void> {
	const todoId = id;
	await todoRepository.deleteById(todoId);
}

export const todoController = {
	get,
	filterTodosByContent,
	create,
	toggleDone,
	deleteById,
};
