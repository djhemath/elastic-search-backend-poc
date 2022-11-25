export class Root {
    public toJSON(): (this | null) {
        return { ...this };
    }

    public toStringJSON(): string {
        return JSON.stringify(this.toJSON());
    }
}