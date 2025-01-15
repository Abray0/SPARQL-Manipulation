import { Parser as SparqlParser } from 'sparqljs';
import { Parser as N3Parser, Store, Quad } from 'n3';
import sampleData from '../data/books.ttl?raw';




interface ParsedQuery {
  queryType: 'SELECT' | 'CONSTRUCT' | 'ASK' | 'DESCRIBE';
  prefixes?: Record<string, string>;
  variables: Variable[];
  where: GroupGraphPattern[];
  order?: Order[];
}

type GroupGraphPattern = GroupGraphPatternBGP | GroupGraphPatternFilter;

interface GroupGraphPatternBGP {
  type: 'bgp';
  triples: TriplePattern[];
}

interface GroupGraphPatternFilter {
  type: 'filter';
  expression: Expression;
}

interface TriplePattern {
  subject: Term;
  predicate: Term;
  object: Term;
}

type Term = Variable | NamedNode | Literal;

interface Variable {
  termType: 'Variable';
  value: string;
}

interface NamedNode {
  termType: 'NamedNode';
  value: string;
}

interface Literal {
  termType: 'Literal';
  value: string;
  datatype?: string;
  language?: string;
}

interface Order {
  variable?: Variable;
  expression?: Variable;
  descending?: boolean;
}

interface Expression {
  type: string; 
  operator?: string; 
  args?: any[];
}


class SparqlEngine {
  private store: Store;
  private parser: InstanceType<typeof SparqlParser>;
  private dataLoaded: boolean;

  constructor() {
    this.store = new Store();
    this.parser = new SparqlParser();
    this.dataLoaded = false;
  }

 
  async loadData(): Promise<void> {
    if (this.dataLoaded) {
      console.log('Data has already been loaded.');
      return;
    }

    const parser = new N3Parser();

    return new Promise<void>((resolve, reject) => {
      parser.parse(sampleData, (error: Error | null, quad: Quad | null) => {
        if (error) {
          reject(error);
          return;
        }
        if (quad) {
          this.store.addQuad(quad);
        }
        if (!quad) {
          this.dataLoaded = true;
          console.log('Data loading complete.');
          resolve();
        }
      });
    });
  }

  
  executeQuery(sparqlQuery: string): any[] {
    if (!this.dataLoaded) {
      throw new Error('Data not loaded. Please load data before executing queries.');
    }

    try {
      const parsedQuery: ParsedQuery = this.parser.parse(sparqlQuery) as ParsedQuery;

      if (parsedQuery.queryType !== 'SELECT') {
        throw new Error('Only SELECT queries are supported.');
      }

      const variables = parsedQuery.variables.map((varObj) => varObj.value);

      const { patterns, filters } = this.extractPatternsAndFilters(parsedQuery);

      const initialBindings = this.matchPatterns(patterns);

      const filteredBindings = this.applyFilters(initialBindings, filters);

      let results = this.projectResults(filteredBindings, variables);

      if (parsedQuery.order && parsedQuery.order.length > 0) {
        results = this.applyOrderBy(results, parsedQuery.order);
      }

      return results;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

 
  private extractPatternsAndFilters(parsedQuery: ParsedQuery): { patterns: TriplePattern[]; filters: Expression[] } {
    const patterns: TriplePattern[] = [];
    const filters: Expression[] = [];

    if (!parsedQuery.where || !Array.isArray(parsedQuery.where)) {
      throw new Error('Unsupported query structure.');
    }

    parsedQuery.where.forEach((pattern) => {
      if (pattern.type === 'bgp' && pattern.triples) {
        pattern.triples.forEach((triple: TriplePattern) => {
          patterns.push(triple);
        });
      } else if (pattern.type === 'filter' && pattern.expression) {
        filters.push(pattern.expression);
      } else {
        throw new Error(`Unsupported pattern type: ${pattern.type}`);
      }
    });

    return { patterns, filters };
  }

 
  private matchPatterns(patterns: TriplePattern[]): Map<string, string>[] {
    let bindings: Map<string, string>[] = [new Map()];

    for (const pattern of patterns) {
      const newBindings: Map<string, string>[] = [];

      for (const binding of bindings) {
        const subject = this.resolveTerm(pattern.subject);
        const predicate = this.resolveTerm(pattern.predicate);
        const object = this.resolveTerm(pattern.object);

        const quads = this.store.getQuads(
          subject.termType === 'Variable' ? null : subject.value,
          predicate.termType === 'Variable' ? null : predicate.value,
          object.termType === 'Variable' ? null : object.value,
          null
        );

        for (const quad of quads) {
          const newBinding = new Map(binding); 

          let isConsistent = true;

          if (pattern.subject.termType === 'Variable') {
            const varName = pattern.subject.value;
            const existing = newBinding.get(varName);
            if (existing && existing !== quad.subject.value) {
              isConsistent = false;
            } else {
              newBinding.set(varName, quad.subject.value);
            }
          }

          if (pattern.predicate.termType === 'Variable') {
            const varName = pattern.predicate.value;
            const existing = newBinding.get(varName);
            if (existing && existing !== quad.predicate.value) {
              isConsistent = false;
            } else {
              newBinding.set(varName, quad.predicate.value);
            }
          }

          if (pattern.object.termType === 'Variable') {
            const varName = pattern.object.value;
            const existing = newBinding.get(varName);
            if (existing && existing !== quad.object.value) {
              isConsistent = false;
            } else {
              newBinding.set(varName, quad.object.value);
            }
          }

          if (isConsistent) {
            newBindings.push(newBinding);
          }
        }
      }

      bindings = newBindings;
    }

    return bindings;
  }


  private applyFilters(bindings: Map<string, string>[], filters: Expression[]): Map<string, string>[] {
    return bindings.filter((binding) => {
      return filters.every((filter) => this.evaluateFilter(filter, binding));
    });
  }

  
  private evaluateFilter(filter: Expression, binding: Map<string, string>): boolean {
    if (filter.type === 'operation' && filter.args && filter.args.length === 2) {
      const left = this.evaluateTerm(filter.args[0], binding);
      const right = this.evaluateTerm(filter.args[1], binding);
      const operator = filter.operator;

      switch (operator) {
        case '<':
          return left < right;
        case '>':
          return left > right;
        case '<=':
          return left <= right;
        case '>=':
          return left >= right;
        case '=':
          return left === right;
        case '!=':
          return left !== right;
        default:
          console.warn(`Unsupported operator in FILTER: ${operator}`);
          return false;
      }
    }

    console.warn(`Unsupported FILTER expression type: ${filter.type}`);
    return false;
  }

  
  private evaluateTerm(term: any, binding: Map<string, string>): string | number {
    if (term.termType === 'Variable') {
      const value = binding.get(term.value);
      if (value === undefined) {
        throw new Error(`Variable ?${term.value} is unbound in FILTER.`);
      }
      const num = Number(value);
      return isNaN(num) ? value : num;
    } else if (term.termType === 'Literal') {
      const num = Number(term.value);
      return isNaN(num) ? term.value : num;
    } else {
      throw new Error(`Unsupported term type in FILTER: ${term.termType}`);
    }
  }

  
  private projectResults(bindings: Map<string, string>[], variables: string[]): any[] {
    return bindings.map((binding) => {
      const result: any = {};
      variables.forEach((varName) => {
        const key = varName; 
        result[key] = binding.get(varName) || null;
      });
      return result;
    });
  }

  
  private applyOrderBy(results: any[], orderCriteria: Order[]): any[] {
    return results.sort((a, b) => {
      for (const order of orderCriteria) {
        console.log('order:', order);
        const varName = order.expression!.value; 
        const valA = a[varName];
        const valB = b[varName];

        if (valA < valB) return order.descending ? 1 : -1;
        if (valA > valB) return order.descending ? -1 : 1;
      }
      return 0;
    });
  }

  private resolveTerm(term: Term): { termType: string; value: string } {
    if (this.isVariable(term)) {
      return { termType: 'Variable', value: term.value };
    } else if (this.isNamedNode(term)) {
      return { termType: 'NamedNode', value: term.value };
    } else if (this.isLiteral(term)) {
      return { termType: 'Literal', value: term.value };
    } else {
      throw new Error(`Unsupported term type: ${JSON.stringify(term)}`);
    }
  }

  private isVariable(term: Term): term is Variable {
    return (term as Variable).termType === 'Variable';
  }

  private isNamedNode(term: Term): term is NamedNode {
    return (term as NamedNode).termType === 'NamedNode';
  }

  private isLiteral(term: Term): term is Literal {
    return (term as Literal).termType === 'Literal';
  }

 
  getValuesForPredicate(predicate: string): string[] {
    const quads = this.store.getQuads(null, predicate, null, null);
    return [...new Set(quads.map((quad) => quad.object.value))];
  }
}

export const sparqlEngine = new SparqlEngine();
