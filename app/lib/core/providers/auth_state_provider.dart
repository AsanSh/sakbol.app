import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';

class AuthState {
  const AuthState({this.profileId, this.accessToken});

  final String? profileId;
  final String? accessToken;

  bool get isAuthenticated => accessToken != null;

  AuthState copyWith({String? profileId, String? accessToken}) => AuthState(
        profileId: profileId ?? this.profileId,
        accessToken: accessToken ?? this.accessToken,
      );

  static const unauthenticated = AuthState();
}

class AuthStateNotifier extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    final client = ref.read(apiClientProvider);
    final token = await client.accessToken;
    if (token == null) return AuthState.unauthenticated;
    // TODO: decode JWT to get profileId (use dart_jsonwebtoken or parse manually)
    return AuthState(accessToken: token);
  }

  Future<void> loginSuccess({
    required String accessToken,
    required String refreshToken,
  }) async {
    final client = ref.read(apiClientProvider);
    await client.saveTokens(accessToken: accessToken, refreshToken: refreshToken);
    state = AsyncData(AuthState(accessToken: accessToken));
  }

  Future<void> logout() async {
    final client = ref.read(apiClientProvider);
    await client.clearTokens();
    state = const AsyncData(AuthState.unauthenticated);
  }
}

final authStateProvider = AsyncNotifierProvider<AuthStateNotifier, AuthState>(
  AuthStateNotifier.new,
);
