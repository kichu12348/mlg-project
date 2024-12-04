class MGLIntrepretor {
    constructor() {
        this.variables = {};
    }

    run(code) {
        try{
        const lines = code
            .split("\n")
            .map(line => line.trim())
            .filter(line => line && !line.startsWith("//"));
        this.execute(lines, 0);
        }catch(e){
            console.error(e.message);
        }
    }

    execute(lines, index, scope = this.variables) {
        while (index < lines.length) {
            const line = lines[index];

            if (line.startsWith("ithanu")) {
                this.handleVariableDeclaration(line, scope);
            } else if (/^para\(/.test(line)) {
                this.handlePara(line, scope);
            } else if (/^aneneki\(/.test(line)) {
                index = this.handleIfBlock(lines, index, line, scope);
            } else if (/^allenki\(/.test(line)) {
                index = this.handleElseIfBlock(lines, index, line, scope);
            } else if (/^avasanam\{/.test(line)) {
                index = this.handleElseBlock(lines, index, scope);
            } else if (/^cheyyu\s+(\w+)/.test(line)) {
                index = this.handleFunctionDeclaration(lines, index, line);
            } else if (/^\w+\(.*\);$/.test(line)) {
                this.handleFunctionCall(line);
            } else {
                throw new Error(`ithu entha bro : "${line}" ?`);
            }
            index++;
        }
    }

    handleVariableDeclaration(line, scope = this.variables) {
        const match = /^ithanu\s+(\w+)\s*=\s*(.+);$/.exec(line);
        if (!match) throw new Error(`Ingane alla variable ezthune: ${line}`);
        const [, variable, valueExpr] = match;
        scope[variable] = this.evaluateExpression(valueExpr, scope);
    }

    handlePara(line, scope = this.variables) {
        const expression = line.slice(5, -2); 
        console.log(this.evaluateExpression(expression, scope));
    }

    handleIfBlock(lines, index, line, scope = this.variables) {
        const condition = this.extractCondition(line, /^aneneki\((.*)\)\{/);
        if (this.evaluateExpression(condition, scope)) {
            return this.executeBlock(lines, index + 1, scope);
        }
        return this.skipBlock(lines, index + 1);
    }

    handleElseIfBlock(lines, index, line, scope = this.variables) {
        const condition = this.extractCondition(line, /^allenki\((.*)\)\{/);
        if (this.evaluateExpression(condition, scope)) {
            return this.executeBlock(lines, index + 1, scope);
        }
        return this.skipBlock(lines, index + 1);
    }

    handleElseBlock(lines, index, scope = this.variables) {
        return this.executeBlock(lines, index + 1, scope);
    }

    handleFunctionDeclaration(lines, index, line) {
        const match = /^cheyyu\s+(\w+)\((.*)\)\s*\{/.exec(line);
        if (!match) throw new Error(`Ingane alla function ezhuthune: ${line}`);
        const [, name, params] = match;
        const paramList = params.split(",").map(p => p.trim());
        const body = [];
        let depth = 1;

        index++;
        while (depth > 0 && index < lines.length) {
            const currentLine = lines[index];
            if (currentLine.includes("{")) depth++;
            if (currentLine.includes("}")) depth--;
            if (depth > 0) body.push(currentLine);
            index++;
        }

        this.variables[name] = { params: paramList, body };
        return index - 1;
    }

    handleFunctionCall(line) {
        const match = /^(\w+)\((.*)\);$/.exec(line);
        if (!match) throw new Error(`function sheri alla : ${line}`);
        const [, name, args] = match;
        const argValues = args.split(",").map(arg => this.evaluateExpression(arg.trim()));
        return this.executeFunctionCall(name, argValues);
    }

    extractCondition(line, regex) {
        const match = regex.exec(line);
        if (!match) throw new Error(`condition sheri alla : ${line}`);
        return match[1];
    }

    executeBlock(lines, index, scope = this.variables) {
        let depth = 1;
        while (depth > 0 && index < lines.length) {
            const line = lines[index];
            if (line.includes("{")) depth++;
            if (line.includes("}")) depth--;
            if (depth > 1) this.execute([line], 0, scope);
            index++;
        }
        return index - 1;
    }

    skipBlock(lines, index) {
        let depth = 1;
        while (depth > 0 && index < lines.length) {
            const line = lines[index];
            if (line.includes("{")) depth++;
            if (line.includes("}")) depth--;
            index++;
        }
        return index - 1;
    }

    evaluateExpression(expr, scope = this.variables) {
        
        expr = expr.trim().replace(/;$/, '');

        
        const funcCallMatch = /^(\w+)\((.*)\)$/.exec(expr);
        if (funcCallMatch) {
            const [, funcName, args] = funcCallMatch;
            const argValues = args.split(",").map(arg => this.evaluateExpression(arg.trim(), scope));
            return this.executeFunctionCall(funcName, argValues);
        }

       
        let replacedExpr = expr.replace(/\b(\w+)\b/g, (match) => {
            if (scope.hasOwnProperty(match)) {
                const value = scope[match];
                if (typeof value === 'string') {
                    
                    return `"${value}"`;
                } else {
                    return value;
                }
            }
            return match;
        });

       
        try {
            const result = eval(replacedExpr);
            return result;
        } catch (error) {
            throw new Error(`Ithu enth expression aa bro ? : ${expr}`);
        }
    }

    executeFunctionCall(name, args) {
        const func = this.variables[name];
        if (!func || !func.body || !func.params) {
            throw new Error(`function illelo bro : ${name}`);
        }

        
        const localScope = Object.create(this.variables);

       
        func.params.forEach((param, index) => {
            localScope[param] = args[index];
        });

        
        let returnValue = null;
        for (let i = 0; i < func.body.length; i++) {
            const line = func.body[i];
            if (line.startsWith("thirichu")) {
                let expression = line.replace(/^thirichu\s*/, '').trim().replace(/;$/, '');
                if (expression === '') {
                    returnValue = null;
                } else {
                    returnValue = this.evaluateExpression(expression, localScope);
                }
                break;
            } else {
                this.execute([line], 0, localScope);
            }
        }

        return returnValue;
    }
}

module.exports = MGLIntrepretor;
