import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';

class AuthRepository {
  AuthRepository(this._client);
  final ApiClient _client;

  Future<({String accessToken, String refreshToken})> register({
    required String displayName,
    required String email,
    required String password,
    String? phoneE164,
  }) async {
    final res = await _client.dio.post<Map<String, dynamic>>(
      '/v1/auth/register',
      data: {
        'displayName': displayName,
        'email': email,
        'password': password,
        if (phoneE164 != null) 'phoneE164': phoneE164,
      },
    );
    return _parseTokens(res.data!);
  }

  Future<({String accessToken, String refreshToken})> login({
    required String identifier,
    required String password,
  }) async {
    final res = await _client.dio.post<Map<String, dynamic>>(
      '/v1/auth/login',
      data: {'identifier': identifier, 'password': password},
    );
    return _parseTokens(res.data!);
  }

  Future<void> logout({required String refreshToken}) async {
    await _client.dio.post<void>(
      '/v1/auth/logout',
      data: {'refreshToken': refreshToken},
    );
  }

  ({String accessToken, String refreshToken}) _parseTokens(Map<String, dynamic> data) => (
        accessToken: data['accessToken'] as String,
        refreshToken: data['refreshToken'] as String,
      );
}

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.read(apiClientProvider)),
);
