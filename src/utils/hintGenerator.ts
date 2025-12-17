import { Task } from "../assets/tasks/tasks";

export interface HintLevel {
  level: number;
  hint: string;
  penalty: number; // XP penalty percentage
}

// Generate hints based on the reference SQL
export function generateHints(task: Task): HintLevel[] {
  const sql = task.referenceSql.toUpperCase();
  const hints: HintLevel[] = [];

  // Level 1: General topic hint (25% penalty)
  hints.push({
    level: 1,
    hint: getTopicHint(task.topic),
    penalty: 25,
  });

  // Level 2: Keywords hint (50% penalty)
  hints.push({
    level: 2,
    hint: getKeywordsHint(sql),
    penalty: 50,
  });

  // Level 3: Structure hint (75% penalty)
  hints.push({
    level: 3,
    hint: getStructureHint(sql, task),
    penalty: 75,
  });

  return hints;
}

function getTopicHint(topic: string): string {
  const topicHints: Record<string, string> = {
    select: "This exercise requires a SELECT statement to retrieve data from the database.",
    groupBy: "You'll need to use GROUP BY to aggregate data by specific columns.",
    join: "This exercise requires joining multiple tables together. Think about which columns connect them.",
    subquery: "Consider using a subquery (a query inside another query) to solve this.",
    cte: "A Common Table Expression (WITH clause) will help organize this complex query.",
    window: "Window functions like ROW_NUMBER(), RANK(), or aggregate functions with OVER() are needed.",
    aggregate: "Aggregate functions like SUM(), COUNT(), AVG(), MIN(), or MAX() are required.",
    advanced: "This is an advanced query combining multiple SQL concepts.",
  };
  return topicHints[topic] || "Think about the SQL fundamentals for this query.";
}

function getKeywordsHint(sql: string): string {
  const keywords: string[] = [];

  if (sql.includes("SELECT")) keywords.push("SELECT");
  if (sql.includes("DISTINCT")) keywords.push("DISTINCT");
  if (sql.includes("FROM")) keywords.push("FROM");
  if (sql.includes("WHERE")) keywords.push("WHERE");
  if (sql.includes("JOIN")) {
    if (sql.includes("LEFT JOIN")) keywords.push("LEFT JOIN");
    else if (sql.includes("RIGHT JOIN")) keywords.push("RIGHT JOIN");
    else if (sql.includes("INNER JOIN")) keywords.push("INNER JOIN");
    else if (sql.includes("FULL")) keywords.push("FULL OUTER JOIN");
    else keywords.push("JOIN");
  }
  if (sql.includes("GROUP BY")) keywords.push("GROUP BY");
  if (sql.includes("HAVING")) keywords.push("HAVING");
  if (sql.includes("ORDER BY")) keywords.push("ORDER BY");
  if (sql.includes("LIMIT")) keywords.push("LIMIT");
  if (sql.includes("UNION")) keywords.push("UNION");
  if (sql.includes("WITH ")) keywords.push("WITH (CTE)");
  if (sql.includes("OVER(") || sql.includes("OVER (")) keywords.push("Window Function");
  if (sql.includes("CASE")) keywords.push("CASE");
  if (sql.includes("COALESCE")) keywords.push("COALESCE");
  if (sql.includes("COUNT(")) keywords.push("COUNT()");
  if (sql.includes("SUM(")) keywords.push("SUM()");
  if (sql.includes("AVG(")) keywords.push("AVG()");
  if (sql.includes("MIN(")) keywords.push("MIN()");
  if (sql.includes("MAX(")) keywords.push("MAX()");

  if (keywords.length === 0) {
    return "This query uses basic SQL syntax.";
  }

  return `Keywords to use: ${keywords.join(", ")}`;
}

function getStructureHint(sql: string, task: Task): string {
  const parts: string[] = [];

  // Count columns in SELECT
  const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM/i);
  if (selectMatch) {
    const selectPart = selectMatch[1];
    if (selectPart === "*") {
      parts.push("SELECT all columns (*)");
    } else {
      const columnCount = selectPart.split(",").length;
      parts.push(`SELECT ${columnCount} column(s)`);
    }
  }

  // Tables
  parts.push(`FROM table(s): ${task.tables.join(", ")}`);

  // Has WHERE
  if (sql.includes("WHERE")) {
    const whereConditions = (sql.match(/AND|OR/gi) || []).length + 1;
    parts.push(`WHERE with ${whereConditions} condition(s)`);
  }

  // Has JOIN
  const joinCount = (sql.match(/JOIN/gi) || []).length;
  if (joinCount > 0) {
    parts.push(`${joinCount} JOIN(s)`);
  }

  // Has GROUP BY
  if (sql.includes("GROUP BY")) {
    const groupByMatch = sql.match(/GROUP BY\s+(.*?)(?:HAVING|ORDER|LIMIT|$)/i);
    if (groupByMatch) {
      const groupColumns = groupByMatch[1].split(",").length;
      parts.push(`GROUP BY ${groupColumns} column(s)`);
    }
  }

  // Has ORDER BY
  if (sql.includes("ORDER BY")) {
    if (sql.includes("DESC")) parts.push("ORDER BY ... DESC");
    else if (sql.includes("ASC")) parts.push("ORDER BY ... ASC");
    else parts.push("ORDER BY ...");
  }

  // Has LIMIT
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    parts.push(`LIMIT ${limitMatch[1]}`);
  }

  return `Query structure: ${parts.join(" → ")}`;
}

// Calculate XP with penalty
export function calculateXPWithPenalty(
  baseXP: number,
  hintLevel: number,
  showedSolution: boolean
): number {
  if (showedSolution) {
    return 0; // No XP if solution was shown
  }

  const penalties = [0, 0.25, 0.5, 0.75]; // 0%, 25%, 50%, 75%
  const penalty = penalties[hintLevel] || 0;

  return Math.floor(baseXP * (1 - penalty));
}
