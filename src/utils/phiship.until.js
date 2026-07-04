const PHI_SHIP_GOC = 30000

export const tinhPhiShip = (giamShip = 0) => {
    return Math.round(PHI_SHIP_GOC * (1 - giamShip / 100))
}