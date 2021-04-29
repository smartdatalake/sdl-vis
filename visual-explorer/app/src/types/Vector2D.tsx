export class Vector2D {
    public x: number;
    public y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    public add(p: Vector2D): Vector2D {
        return new Vector2D(this.x + p.x, this.y + p.y);
    }

    public scale(s: number): Vector2D {
        return new Vector2D(this.x * s, this.y * s);
    }
}
