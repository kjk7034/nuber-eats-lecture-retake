# [풀스택] 우버 이츠 클론코딩

3년 전에 [[풀스택] 우버 이츠 클론코딩](https://nomadcoders.co/nuber-eats/lobby) 강의를 수강했었다. 또한, [챌린지 5기](https://nomadcoders.co/community/thread/1290)도 완료!! (nanofe).

그 후 백엔드 개발을 하지 않아서 많은 것을 잊어버렸고, 백엔드 개발을 해야 할 기회가 생겨 재수강을 하면서 다시 정리를!!

## 진행하면서 발생한 내용들 메모

- 2강 GRAPHQL API 설정 시 버전 차이로 GraphQLModule driver가 추가 되었다.
- 강의에서는 TypeORM + PostgreSQL을 사용했지만, MongoDB를 활용해보기 위해서 [Nest JS Mongo](https://docs.nestjs.com/techniques/mongodb)를 참고해서 적용했다.
- TypeORM을 이용해서 MongoDB를 사용할 수 있지만, TypeORM이 주로 관계형 데이터베이트에 최적화 되어 있다고 알고 있어서 Mongoose를 택함.
