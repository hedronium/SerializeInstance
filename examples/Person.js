exports.Person = class Person {
    constructor(first_name, last_name) {
        this.f_name = first_name;
        this.l_name = last_name;
    }

    name() {
        return `${this.f_name} ${this.l_name}`;
    }
}