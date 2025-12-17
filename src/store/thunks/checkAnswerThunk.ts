import { upsertSolution } from "../reducers/solutionsReducer";
import { setLastAnswerResult } from "../reducers/taskReducer";
import { createAppAsyncThunk, selectSolutionById } from "../store";
import { executeQuery } from "../../lib/api";
import initSqlJs, { Database } from "sql.js";

export const checkAnswer = createAppAsyncThunk(
  "tasks/checkAnswer",
  async (_: void, { dispatch, getState }) => {
    const {
      task: { selected },
    } = getState();
    const solution = selected
      ? selectSolutionById(getState(), selected)
      : undefined;

    if (!selected || !solution) {
      console.warn("Can't check answer when task is not selected!");
      return;
    }

    dispatch(upsertSolution({ ...solution, status: "PROCESSING" }));

    try {
      // Import task definitions
      const tasksModule = await import("../../assets/tasks/tasks");
      const task = tasksModule.tasksList.find(t => t.id === selected);

      if (!task) {
        throw new Error(`Task ${selected} not found`);
      }

      console.log("🚀 Checking task:", task.id);
      console.log("Query:", solution.query);

      // Use SQL.js for static data validation
      const SQL = await initSqlJs({
        locateFile: (file) => `/${file}`,
      });

      const databasesModule = await import("../../assets/databases/databases");
      const databaseObj = databasesModule.databases[task.database as keyof typeof databasesModule.databases];

      const db: Database = new SQL.Database();

      // For accounting database, we need to load music first (accounting extends music)
      if (task.database === 'accounting') {
        const musicDb = databasesModule.databases['music'];
        if (musicDb && musicDb.initSql) {
          db.run(musicDb.initSql);
        }
      }

      // Load the target database SQL
      if (databaseObj && databaseObj.initSql) {
        db.run(databaseObj.initSql);
      } else {
        throw new Error(`Database ${task.database} has no initSql defined`);
      }

      // Execute both queries
      let userResult: any[];
      try {
        userResult = db.exec(solution.query);
      } catch (sqlError: any) {
        db.close();
        // Only show SQL errors to user
        dispatch(upsertSolution({ ...solution, status: "INCORRECT", error: sqlError.message }));
        return;
      }

      const expectedResult = db.exec(task.referenceSql);

      dispatch(setLastAnswerResult(userResult as any));

      const userColumns = userResult[0]?.columns || [];
      const userData = userResult[0]?.values || [];
      const expectedColumns = expectedResult[0]?.columns || [];
      const expectedData = expectedResult[0]?.values || [];

      // Compare columns (order matters for SELECT)
      const columnsMatch = JSON.stringify(userColumns) === JSON.stringify(expectedColumns);
      const rowCountMatch = userData.length === expectedData.length;
      const dataMatch = JSON.stringify(userData) === JSON.stringify(expectedData);

      db.close();

      if (columnsMatch && rowCountMatch && dataMatch) {
        console.log("✅ Query is CORRECT!");
        dispatch(upsertSolution({ ...solution, status: "CORRECT" }));
      } else {
        let error = "";
        if (!columnsMatch) {
          error = `Wrong columns. Expected: [${expectedColumns.join(', ')}], got: [${userColumns.join(', ')}]`;
        } else if (!rowCountMatch) {
          error = `Wrong number of rows. Expected ${expectedData.length} rows, got ${userData.length} rows`;
        } else {
          // Data mismatch - likely wrong ORDER BY
          error = `Results are not in the expected order. Check your ORDER BY clause.`;
        }
        console.log("❌ Query is INCORRECT:", error);
        dispatch(upsertSolution({ ...solution, status: "INCORRECT", error }));
      }

      /* BACKEND CODE COMMENTED OUT FOR STATIC DATA TESTING
      // Try backend first
      try {
        const taskIndex = tasksModule.tasksList.findIndex(t => t.id === selected);
        const numericTaskId = taskIndex >= 0 ? taskIndex + 1 : 1;

        const backendResult = await executeQuery({
          query: solution.query,
          task_id: numericTaskId,
        });

        console.log("✅ Backend executed query");
        console.log("Result:", backendResult);

        // Convert backend response to expected format for display
        const userData = backendResult.user_data.map(row => Object.values(row));
        const solutionResult = backendResult.user_data.length > 0
          ? [{ columns: backendResult.user_columns, values: userData }]
          : [];

        dispatch(setLastAnswerResult(solutionResult as any));

        // Execute reference query on backend to compare
        const expectedResult = await executeQuery({
          query: task.referenceSql,
          task_id: numericTaskId,
        });

        console.log("Expected columns:", expectedResult.user_columns);
        console.log("Expected rows:", expectedResult.user_data.length);
        console.log("Got columns:", backendResult.user_columns);
        console.log("Got rows:", backendResult.user_data.length);

        // Compare results
        const expectedData = expectedResult.user_data.map(row => Object.values(row));

        // Check if results match
        const columnsMatch = JSON.stringify(backendResult.user_columns.sort()) ===
          JSON.stringify(expectedResult.user_columns.sort());
        const rowCountMatch = userData.length === expectedData.length;
        const dataMatch = JSON.stringify(userData) === JSON.stringify(expectedData);

        if (columnsMatch && rowCountMatch && dataMatch) {
          console.log("✅ Query is CORRECT!");
          dispatch(upsertSolution({ ...solution, status: "CORRECT" }));
        } else {
          let error = "";
          if (!columnsMatch) {
            error = `Column mismatch: got [${backendResult.user_columns.join(', ')}], expected [${expectedResult.user_columns.join(', ')}]`;
          } else if (!rowCountMatch) {
            error = `Row count mismatch: got ${userData.length} rows, expected ${expectedData.length} rows`;
          } else {
            error = `Data mismatch: your results don't match the expected output`;
          }
        console.log("❌ Query is INCORRECT:", error);
        dispatch(upsertSolution({ ...solution, status: "INCORRECT", error }));
      }

      /* BACKEND CODE COMMENTED OUT FOR STATIC DATA TESTING
      // Try backend first
      try {
        const taskIndex = tasksModule.tasksList.findIndex(t => t.id === selected);
        const numericTaskId = taskIndex >= 0 ? taskIndex + 1 : 1;

        const backendResult = await executeQuery({
          query: solution.query,
          task_id: numericTaskId,
        });

        console.log("✅ Backend executed query");
        console.log("Result:", backendResult);

        // Convert backend response to expected format for display
        const userData = backendResult.user_data.map(row => Object.values(row));
        const solutionResult = backendResult.user_data.length > 0
          ? [{ columns: backendResult.user_columns, values: userData }]
          : [];

        dispatch(setLastAnswerResult(solutionResult as any));

        // Execute reference query on backend to compare
        const expectedResult = await executeQuery({
          query: task.referenceSql,
          task_id: numericTaskId,
        });

        console.log("Expected columns:", expectedResult.user_columns);
        console.log("Expected rows:", expectedResult.user_data.length);
        console.log("Got columns:", backendResult.user_columns);
        console.log("Got rows:", backendResult.user_data.length);

        // Compare results
        const expectedData = expectedResult.user_data.map(row => Object.values(row));

        // Check if results match
        const columnsMatch = JSON.stringify(backendResult.user_columns.sort()) ===
          JSON.stringify(expectedResult.user_columns.sort());
        const rowCountMatch = userData.length === expectedData.length;
        const dataMatch = JSON.stringify(userData) === JSON.stringify(expectedData);

        if (columnsMatch && rowCountMatch && dataMatch) {
          console.log("✅ Query is CORRECT!");
          dispatch(upsertSolution({ ...solution, status: "CORRECT" }));
        } else {
          let error = "";
          if (!columnsMatch) {
            error = `Column mismatch: got [${backendResult.user_columns.join(', ')}], expected [${expectedResult.user_columns.join(', ')}]`;
          } else if (!rowCountMatch) {
            error = `Row count mismatch: got ${userData.length} rows, expected ${expectedData.length} rows`;
          } else {
            error = `Data mismatch: your results don't match the expected output`;
          }
          console.log("❌ Query is INCORRECT:", error);
          dispatch(upsertSolution({ ...solution, status: "INCORRECT", error }));
        }

      } catch (backendError: any) {
        console.warn("Backend unavailable, falling back to SQL.js:", backendError.message);

        // Fallback to SQL.js
        const SQL = await initSqlJs({
          locateFile: (file) => `/${file}`,
        });

        const databasesModule = await import("../../assets/databases/databases");
        const databaseObj = databasesModule.databases[task.database as keyof typeof databasesModule.databases];

        const db: Database = new SQL.Database();
        const sqlStatements = typeof databaseObj === 'string' ? databaseObj : databaseObj.sql;
        db.run(sqlStatements);

        // Execute both queries
        const userResult = db.exec(solution.query);
        const expectedResult = db.exec(task.referenceSql);

        dispatch(setLastAnswerResult(userResult as any));

        const userColumns = userResult[0]?.columns || [];
        const userData = userResult[0]?.values || [];
        const expectedColumns = expectedResult[0]?.columns || [];
        const expectedData = expectedResult[0]?.values || [];

        const columnsMatch = JSON.stringify(userColumns.sort()) === JSON.stringify(expectedColumns.sort());
        const rowCountMatch = userData.length === expectedData.length;
        const dataMatch = JSON.stringify(userData) === JSON.stringify(expectedData);

        db.close();

        if (columnsMatch && rowCountMatch && dataMatch) {
          dispatch(upsertSolution({ ...solution, status: "CORRECT" }));
        } else {
          let error = "";
          if (!columnsMatch) {
            error = `Column mismatch: got [${userColumns.join(', ')}], expected [${expectedColumns.join(', ')}]`;
          } else if (!rowCountMatch) {
            error = `Row count mismatch: got ${userData.length} rows, expected ${expectedData.length} rows`;
          } else {
            error = `Data mismatch`;
          }
          dispatch(upsertSolution({ ...solution, status: "INCORRECT", error }));
        }
      }
      */

    } catch (e: any) {
      console.error("❌ Error checking answer:", e);
      // Filter error message to only show SQL-related errors
      let errorMessage = e.message || "Unknown error";

      // Common SQL.js error patterns - make them user-friendly
      if (errorMessage.includes("no such table")) {
        errorMessage = errorMessage; // Keep as-is, it's clear
      } else if (errorMessage.includes("no such column")) {
        errorMessage = errorMessage;
      } else if (errorMessage.includes("syntax error")) {
        errorMessage = "SQL syntax error: " + errorMessage.replace(/.*syntax error/, "Check your SQL syntax");
      } else if (errorMessage.includes("SQLITE")) {
        // Keep SQLite errors as they are informative
      } else {
        // For non-SQL errors, show a generic message
        errorMessage = "Error executing query. Please check your SQL syntax.";
      }

      dispatch(upsertSolution({ ...solution, status: "INCORRECT", error: errorMessage }));
    }
  }
);
