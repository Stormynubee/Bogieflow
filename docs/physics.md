# Design Depth Appendix: Mathematical & Physics-Based Foundations

This document details the mathematical models and physics-based formulations underlying the **RailTwin-X** predictive railway infrastructure management system. 

---

## 1. Dynamic Vehicle-Track Interaction (Winkler Foundation)

The rail is modeled as an infinite Euler-Bernoulli beam resting on a continuous, Viscous-Elastic Winkler foundation under moving dynamic wheel loads.

The vertical deflection $y(x,t)$ of the rail is governed by the following partial differential equation (PDE):
$$\text{EI}\frac{\partial^4 y(x,t)}{\partial x^4} + m_{\text{rail}}\frac{\partial^2 y(x,t)}{\partial t^2} + c_{\text{track}}\frac{\partial y(x,t)}{\partial t} + k_{\text{track}}y(x,t) = F_{\text{wheel}}(x,t)$$

Where:
* $\text{EI}$ is the flexural rigidity of the rail section (product of Young's Modulus $E$ and moment of inertia $I$).
* $m_{\text{rail}}$ is the mass per unit length of the rail.
* $c_{\text{track}}$ is the equivalent damping coefficient of the ballast, subgrade, and pad.
* $k_{\text{track}}$ is the track-bed elastic stiffness parameter (Winkler modulus).
* $F_{\text{wheel}}(x,t)$ is the vertical wheel load moving at speed $v$: $F_{\text{wheel}}(x,t) = P_0 \delta(x - vt)$ where $\delta$ is the Dirac delta function and $P_0$ is the static wheel load.

### Ballast Voids & Mud Pumping
When water logging occurs (high soil moisture + rainfall), mud pumping expels fines from the subgrade, creating voids underneath the sleepers. This causes a local drop in track stiffness $k_{\text{track}} \to 0$. As a result:
1. The vertical deflection $y(x,t)$ increases significantly.
2. The dynamic force transmission increases, causing high-g shock profiles recorded by the bogie-mounted axle box accelerometers (ABA):
   $$a_z(t) = \frac{\partial^2 y(x_{\text{bogie}}, t)}{\partial t^2}$$

---

## 2. Signal Processing: Continuous Wavelet Transform (CWT)

Because axle box vibration signals ($a_z(t)$) are non-stationary and highly contaminated by engine noise and wheels flat impacts, a Continuous Wavelet Transform (CWT) is applied to extract localized transient anomalies:
$$W(a,b) = \frac{1}{\sqrt{|a|}}\int_{-\infty}^{\infty} a_z(t) \psi^*( \frac{t-b}{a} ) \text{dt}$$

Where:
* $a$ is the scale parameter (frequency domain scaling).
* $b$ is the translation parameter (time domain shift).
* $\psi^*(t)$ is the complex conjugate of the Daubechies 4 ($\text{db4}$) mother wavelet, selected for its correlation with shock signals.

In the RailTwin-X production system (Phase 2), these 2D time-frequency scalograms are fed into an edge convolutional network to isolate track joint defects, spalls, and ballast voids from regular track wear.

---

## 3. Hydrology Risk Indexing ($H_i$)

Track-bed subgrade degradation is strongly accelerated by moisture. The hydrology risk index ($H_i$) represents the probability of water logging and ballast fouling:
$$H_i = 0.6 \cdot R + 0.4 \cdot M$$

Where:
* $R \in [0, 1]$ is the normalized rainfall intensity.
* $M \in [0, 1]$ is the normalized soil moisture level.

The effective track stiffness $k_{\text{effective}}$ dynamically degrades under high moisture:
$$k_{\text{effective}} = k_{\text{nominal}} \cdot (1 - \lambda \cdot H_i)$$
Where $\lambda \approx 0.4$ represents the maximum subgrade stiffness degradation factor.
