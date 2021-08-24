import { Injectable, NgZone } from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { User } from '../interfaces/user';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone
  ) { 
    this.afAuth.authState.subscribe(u => {
      if(u){
        this.userData = u;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  async SignIn(email: string, password: string) {
    return await this.afAuth.signInWithEmailAndPassword(email, password)
    .then(res => {
      this.ngZone.run(() => {
        this.router.navigate(['/']);
      })
    }).catch(console.log)
  }

  async SendVerificationMail() {
    return await this.afAuth.currentUser.then(u => u.sendEmailVerification()).then(() => {
      this.router.navigate(['verify-email']);
    })
  }

  async ForgotPassword(passwordResetEmail: string) {
    return await this.afAuth.sendPasswordResetEmail(passwordResetEmail)
    .then(() => {
      window.alert('PSW Reset Sent');
    }).catch(e => window.alert(e))
  }

  get isLoggedIn(): boolean{
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true: false;
  }

  GoogleAuth() {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider)
  }

  async AuthLogin(provider) {
    return await this.afAuth.signInWithPopup(provider)
    .then(res => {
      this.ngZone.run(() => {
        this.router.navigate([''])
      })
      this.SetUserData(res.user)
    }).catch(e => window.alert(e))
  }

  SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }
    return userRef.set(userData, {merge: true})
  }

  SignOut() {
    return this.afAuth.signOut()
    .then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['/'])
    })
  }

  get getUser(): any {
    return JSON.parse(localStorage.getItem('user'))
  }
}
