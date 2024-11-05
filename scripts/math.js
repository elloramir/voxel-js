export class Mat4 {
	constructor() {
		this.data = new Float32Array(16);
	}

	identity() {
		this.data.fill(0);
		this.data[0] = 1;
		this.data[5] = 1;
		this.data[10] = 1;
		this.data[15] = 1;

		return this;
	}

	perspective(fov, aspect, near, far) {
		const f = 1.0 / Math.tan(fov / 2);
		const nf = 1 / (near - far);

		this.data[0] = f / aspect;
		this.data[5] = f;
		this.data[10] = (far + near) * nf;
		this.data[11] = -1;
		this.data[14] = 2 * far * near * nf;
		this.data[15] = 0;
	}

	lookAt(eye, target, up) {
		const z = new Vec3(eye.x - target.x, eye.y - target.y, eye.z - target.z).normalize();
		const x = new Vec3(up.y * z.z - up.z * z.y, up.z * z.x - up.x * z.z, up.x * z.y - up.y * z.x).normalize();
		const y = new Vec3(z.y * x.z - z.z * x.y, z.z * x.x - z.x * x.z, z.x * x.y - z.y * x.x).normalize();

		this.data[0] = x.x;
		this.data[1] = y.x;
		this.data[2] = z.x;
		this.data[3] = 0;

		this.data[4] = x.y;
		this.data[5] = y.y;
		this.data[6] = z.y;
		this.data[7] = 0;

		this.data[8] = x.z;
		this.data[9] = y.z;
		this.data[10] = z.z;
		this.data[11] = 0;

		this.data[12] = -x.x * eye.x - x.y * eye.y - x.z * eye.z;
		this.data[13] = -y.x * eye.x - y.y * eye.y - y.z * eye.z;
		this.data[14] = -z.x * eye.x - z.y * eye.y - z.z * eye.z;
		this.data[15] = 1;
	}
}

export class Vec3 {
	constructor(x, y, z) {
		this.set(x, y, z);
	}

	set(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;

		return this;
	}

	normalize() {
		const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
		
		if (length !== 0) {
			this.x /= length;
			this.y /= length;
			this.z /= length;
		}

		return this;
	}
}

export class Vec2 {
	constructor(x, y) {
		this.set(x, y);
	}

	set(x, y) {
		this.x = x;
		this.y = y;
	}
}

export function degToRad(degrees) {
	return degrees * Math.PI / 180;
}